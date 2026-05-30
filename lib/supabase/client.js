'use client';

import { createBrowserClient } from '@supabase/ssr';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// App vẫn chạy được (đăng nhập ID cũ / SĐT) khi CHƯA cấu hình Supabase.
export const isSupabaseConfigured = Boolean(url && key);

let _client = null;
export function getSupabaseBrowser() {
  if (!isSupabaseConfigured) return null;
  if (!_client) _client = createBrowserClient(url, key);
  return _client;
}
