// Tra cứu sản phẩm theo mã vạch qua Open Food Facts (miễn phí, không cần API key).
// Trả về dinh dưỡng /100g, khớp model thư viện món ăn (unit: 'g', per: 100).

const round1 = (v) => (v == null || isNaN(v) ? 0 : Math.round(Number(v) * 10) / 10);

const OFF_UA = "StayFit/1.0 (stayfit.id.vn)";

// kcal/100g từ object nutriments (ưu tiên kcal, fallback kJ → kcal).
function extractKcal(n) {
  let kcal = n["energy-kcal_100g"];
  if (kcal == null) kcal = n["energy-kcal_value"];
  if (kcal == null && n["energy_100g"] != null) kcal = n["energy_100g"] / 4.184;
  return kcal;
}

// Trích macro /100g. hasData=true khi OFF thực sự có ít nhất 1 trường dinh dưỡng
// (kể cả giá trị 0 — vd nước ngọt light gần 0 kcal vẫn là dữ liệu hợp lệ).
function macrosFrom(n) {
  const kcal = extractKcal(n);
  return {
    kcal: kcal != null ? Math.round(kcal) : 0,
    protein: round1(n.proteins_100g),
    carb: round1(n.carbohydrates_100g),
    fat: round1(n.fat_100g),
    hasData:
      kcal != null ||
      n.proteins_100g != null ||
      n.carbohydrates_100g != null ||
      n.fat_100g != null,
  };
}

// OFF search theo tên: tìm 1 entry KHÁC có đủ dinh dưỡng (cho sản phẩm mà mã vạch gốc thiếu số liệu).
// Chọn kết quả đầu tiên có dinh dưỡng VÀ tên chia sẻ ít nhất 1 token với truy vấn (tránh khớp lung tung).
async function searchByName(name) {
  if (!name) return null;
  // Bỏ token kích cỡ/dung tích ("1,25L", "330ml", "500") — chúng làm hẹp kết quả về đúng entry thiếu data.
  let q = name
    .replace(/\b\d+([.,]\d+)?\s?(l|lít|lit|ml|cl|kg|g|gr|oz)\b/gi, " ")
    .replace(/\b\d+([.,]\d+)?\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!q) q = name;
  const queryTokens = q.toLowerCase().split(/\s+/).filter((t) => t.length >= 3);
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&json=1&action=process&page_size=10&fields=product_name,nutriments`;
  // OFF search hay 503 chập chờn → thử lại 1 lần. Có JSON rồi thì không thử lại nữa.
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": OFF_UA }, signal: AbortSignal.timeout(5000) });
      if (!res.ok) continue;
      const data = await res.json().catch(() => null);
      if (!data) continue;
      for (const prod of data.products || []) {
        const m = macrosFrom(prod.nutriments || {});
        if (!m.hasData) continue;
        const candName = (prod.product_name || "").toLowerCase();
        const relevant = queryTokens.length === 0 || queryTokens.some((t) => candName.includes(t));
        if (relevant) return m;
      }
      return null;
    } catch (e) {
      /* timeout/mạng → thử lại */
    }
  }
  return null;
}

export async function GET(request) {
  const code = new URL(request.url).searchParams.get("code");
  if (!code || !/^\d{6,14}$/.test(code)) {
    return Response.json({ error: "Mã vạch không hợp lệ" }, { status: 400 });
  }

  try {
    const fields = "product_name,product_name_vi,brands,nutriments,image_front_small_url";
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${code}?fields=${fields}`,
      { headers: { "User-Agent": OFF_UA }, signal: AbortSignal.timeout(8000) }
    );
    const data = await res.json().catch(() => null);
    const p = data?.product;

    if (!p || data?.status === 0) {
      return Response.json({ found: false });
    }

    const baseName = (p.product_name_vi || p.product_name || "").trim();
    const brand = p.brands ? p.brands.split(",")[0].trim() : "";
    // Chỉ ghép brand khi tên chưa chứa brand (tránh "Nutella (Nutella)").
    const includeBrand = brand && baseName && !baseName.toLowerCase().includes(brand.toLowerCase());
    const name = (includeBrand ? `${baseName} (${brand})` : baseName || `Sản phẩm ${code}`).slice(0, 80);

    let macros = macrosFrom(p.nutriments || {});
    let estimated = false;

    // Có tên nhưng thiếu dinh dưỡng → thử tra theo tên để lấy số liệu ước lượng.
    if (!macros.hasData && baseName) {
      const fallback = await searchByName(baseName);
      if (fallback) {
        macros = fallback;
        estimated = true;
      }
    }

    return Response.json({
      found: true,
      hasNutrition: macros.hasData,
      estimated,
      product: {
        name,
        unit: "g",
        per: 100,
        kcal: macros.kcal,
        protein: macros.protein,
        carb: macros.carb,
        fat: macros.fat,
        image: p.image_front_small_url || null,
        barcode: code,
      },
    });
  } catch (e) {
    return Response.json({ error: "Lỗi tra cứu sản phẩm. Thử lại." }, { status: 502 });
  }
}
