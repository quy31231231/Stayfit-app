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

// Upload 1 file ảnh → trả về key (lưu vào DB). kind: 'meal' | 'avatar'.
export async function uploadImage(token, kind, file) {
  const type = file.type || 'image/jpeg';
  const { url, key } = await sign(token, { op: 'put', kind, contentType: type });
  const put = await fetch(url, { method: 'PUT', headers: { 'Content-Type': type }, body: file });
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
