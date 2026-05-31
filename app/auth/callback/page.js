'use client';

import { useEffect } from 'react';
import { getSupabaseBrowser } from '../../../lib/supabase/client';

// Sau redirect từ Google: client tự đổi ?code= → session (detectSessionInUrl=true).
// Trang này chỉ chờ có session rồi về '/'. Có timeout chống treo.
export default function AuthCallback() {
  useEffect(() => {
    const sb = getSupabaseBrowser();
    const go = () => window.location.replace('/');
    if (!sb) return go();

    let done = false;
    const finish = () => { if (!done) { done = true; go(); } };

    // Khi session sẵn sàng → về trang chủ.
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => {
      if (session) finish();
    });
    // Trường hợp session đã có sẵn ngay.
    sb.auth.getSession().then(({ data }) => { if (data.session) finish(); });
    // Fallback: dù sao cũng về trang chủ sau 4s (gate ở '/' sẽ xử lý tiếp).
    const t = setTimeout(finish, 4000);

    return () => { clearTimeout(t); sub.subscription.unsubscribe(); };
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FBF8F2', color: '#2D2620', fontWeight: 600 }}>
      Đang đăng nhập…
    </div>
  );
}
