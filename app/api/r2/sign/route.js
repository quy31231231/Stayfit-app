import { randomUUID } from 'crypto';
import { verifySupabaseToken } from '../../../../lib/supabase/verify';
import { presignPut, presignGet, isR2Configured } from '../../../../lib/r2/server';

// Ký URL tạm cho R2. Key luôn do SERVER đặt theo uid → không ai đụng file người khác.
//   op:'put'  { kind:'meal'|'avatar', contentType } → { url, key }
//   op:'get'  { keys:[...] }                         → { urls: { key: signedUrl } }
// Client gửi access token Supabase qua field `password` (giống route AI).

const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

// Chỉ ký GET cho key thuộc về chính uid.
const ownsKey = (key, uid) =>
  typeof key === 'string' && (key.startsWith(`meals/${uid}/`) || key.startsWith(`avatars/${uid}`));

export async function POST(req) {
  try {
    if (!isR2Configured) {
      return Response.json({ error: 'Server chưa cấu hình R2' }, { status: 500 });
    }

    const { password, op, kind, contentType, keys } = await req.json();

    const authUser = await verifySupabaseToken(password);
    if (!authUser) {
      return Response.json({ error: 'Phiên đăng nhập không hợp lệ' }, { status: 401 });
    }
    const uid = authUser.id;

    if (op === 'put') {
      const type = typeof contentType === 'string' && contentType.startsWith('image/') ? contentType : 'image/jpeg';
      const ext = EXT[type] || 'jpg';
      let key;
      if (kind === 'avatar') key = `avatars/${uid}.${ext}`;
      else if (kind === 'meal') key = `meals/${uid}/${randomUUID()}.${ext}`;
      else return Response.json({ error: 'kind không hợp lệ' }, { status: 400 });

      const url = await presignPut(key, type);
      return Response.json({ url, key });
    }

    if (op === 'get') {
      const list = Array.isArray(keys) ? keys.filter((k) => ownsKey(k, uid)).slice(0, 100) : [];
      const signed = await Promise.all(list.map((k) => presignGet(k)));
      const urls = {};
      list.forEach((k, i) => { urls[k] = signed[i]; });
      return Response.json({ urls });
    }

    return Response.json({ error: 'op không hợp lệ' }, { status: 400 });
  } catch (err) {
    console.error('[r2/sign]', err);
    return Response.json({ error: err.message || 'Lỗi server' }, { status: 500 });
  }
}
