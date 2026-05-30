// Tra cứu sản phẩm theo mã vạch qua Open Food Facts (miễn phí, không cần API key).
// Trả về dinh dưỡng /100g khi OFF có; nếu thiếu, client sẽ nhờ Gemini ước lượng từ tên.

const round1 = (v) => (v == null || isNaN(v) ? 0 : Math.round(Number(v) * 10) / 10);

const OFF_UA = "StayFit/1.0 (stayfit.id.vn)";

// kcal/100g từ object nutriments (ưu tiên kcal, fallback kJ → kcal).
function extractKcal(n) {
  let kcal = n["energy-kcal_100g"];
  if (kcal == null) kcal = n["energy-kcal_value"];
  if (kcal == null && n["energy_100g"] != null) kcal = n["energy_100g"] / 4.184;
  return kcal;
}

// hasData=true khi OFF thực sự có ít nhất 1 trường dinh dưỡng (kể cả giá trị 0 — vd nước light gần 0 kcal).
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

    const macros = macrosFrom(p.nutriments || {});

    return Response.json({
      found: true,
      hasNutrition: macros.hasData,
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
