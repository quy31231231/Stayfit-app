// Helper client cho R2 qua presigned URL. `token` = Supabase access token (page.js giữ ở biến `password`).

async function sign(token, body) {
  const res = await fetch('/api/r2/sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: token, ...body }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Lỗi ký URL R2');
  return data;
}

// Resize ảnh raster về cạnh dài tối đa `maxDim`, xuất JPEG → giảm dung lượng upload/R2.
// Mọi lỗi (định dạng lạ, canvas chặn...) → trả file gốc, không làm hỏng luồng upload.
async function downscale(file, maxDim = 1280, quality = 0.82) {
  if (typeof document === 'undefined') return file;
  if (!file.type || !/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
  try {
    // imageOrientation:'from-image' → bake EXIF rotation vào pixel, tránh ảnh chụp dọc bị xoay ngang.
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 600 * 1024) { bitmap.close?.(); return file; }
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();
    const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', quality));
    return blob ? new File([blob], 'photo.jpg', { type: 'image/jpeg' }) : file;
  } catch { return file; }
}

// Upload 1 file ảnh → trả về key (lưu vào DB). kind: 'meal' | 'avatar'.
export async function uploadImage(token, kind, file) {
  const img = await downscale(file);
  const type = img.type || 'image/jpeg';
  const { url, key } = await sign(token, { op: 'put', kind, contentType: type });
  const put = await fetch(url, { method: 'PUT', headers: { 'Content-Type': type }, body: img });
  if (!put.ok) throw new Error('Upload ảnh lên R2 thất bại');
  return key;
}

// Đổi loạt key → URL hiển thị tạm thời. Trả về { key: url }.
export async function signGets(token, keys) {
  const list = (keys || []).filter(Boolean);
  if (list.length === 0) return {};
  const { urls } = await sign(token, { op: 'get', keys: list });
  return urls || {};
}
