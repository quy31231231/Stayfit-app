'use client';

import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// App vẫn chạy được (đăng nhập SĐT / Google) khi CHƯA cấu hình Supabase.
export const isSupabaseConfigured = Boolean(url && key);

let _client = null;
// SPA client: lưu session ở localStorage, tự refresh token. PKCE nhưng KHÔNG auto-detect URL
// (ta đổi mã thủ công ở /auth/callback để tránh double-exchange).
export function getSupabaseBrowser() {
  if (!isSupabaseConfigured) return null;
  if (!_client) {
    _client = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true, // tự đổi ?code= → session khi load /auth/callback
        flowType: 'pkce',
      },
    });
  }
  return _client;
}
