// Tra cứu NHẬN DẠNG sản phẩm theo mã vạch qua Open Food Facts (miễn phí, không cần API key).
// Dùng cho tính năng "Kiểm tra sản phẩm" — trả tên/thương hiệu/ảnh đã đăng ký để user đối chiếu.
// LƯU Ý: KHÔNG khẳng định thật/giả — chỉ là thông tin tham khảo.

const OFF_UA = "StayFit/1.0 (stayfit.id.vn)";

export async function GET(request) {
  const code = new URL(request.url).searchParams.get("code");
  if (!code || !/^\d{6,14}$/.test(code)) {
    return Response.json({ error: "Mã vạch không hợp lệ" }, { status: 400 });
  }

  try {
    const fields = "product_name,product_name_vi,brands,image_front_small_url";
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${code}?fields=${fields}`,
      { headers: { "User-Agent": OFF_UA }, signal: AbortSignal.timeout(8000) }
    );
    const data = await res.json().catch(() => null);
    const p = data?.product;

    if (!p || data?.status === 0) {
      return Response.json({ found: false });
    }

    const name = (p.product_name_vi || p.product_name || "").trim();
    const brand = p.brands ? p.brands.split(",")[0].trim() : "";

    return Response.json({
      found: true,
      product: {
        name: name || `Sản phẩm ${code}`,
        brand,
        image: p.image_front_small_url || null,
      },
    });
  } catch (e) {
    return Response.json({ error: "Lỗi tra cứu sản phẩm. Thử lại." }, { status: 502 });
  }
}
