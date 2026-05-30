'use client';

import { useEffect } from 'react';
import { getSupabaseBrowser } from '../../../lib/supabase/client';

// Trang nhận redirect từ Google (qua Supabase). Đổi authorization code → session (lưu localStorage),
// rồi quay về trang chủ. Client-side PKCE: code_verifier nằm trong localStorage của chính trình duyệt này.
export default function AuthCallback() {
  useEffect(() => {
    const go = () => window.location.replace('/');
    const sb = getSupabaseBrowser();
    if (!sb) return go();

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const errDesc = params.get('error_description');
    if (errDesc) { console.error('[auth/callback]', errDesc); return go(); }
    if (!code) return go();

    sb.auth.exchangeCodeForSession(code)
      .then(({ error }) => { if (error) console.error('[auth/callback] exchange:', error.message); })
      .finally(go);
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FBF8F2', color: '#2D2620', fontWeight: 600 }}>
      Đang đăng nhập…
    </div>
  );
}
