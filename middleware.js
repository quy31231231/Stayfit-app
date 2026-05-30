import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Per-route-type rate limit buckets. In-memory only (sufficient for personal app).
const buckets = {
  default: new Map(),
  vision:  new Map(),
};

const WINDOW_MS = 60_000;
const LIMIT_DEFAULT = 30;
const LIMIT_VISION  = 10;  // Vision API tốn hơn, limit chặt hơn

const RATE_LIMITED_PREFIXES = [
  '/api/sync',
  '/api/save-meal',
  '/api/vision-analyze',
  '/api/text-analyze',
  '/api/barcode',
];

// Rate limit cho các API route. Trả về Response 429 nếu vượt, ngược lại null.
function rateLimit(req) {
  const path = req.nextUrl.pathname;
  if (!RATE_LIMITED_PREFIXES.some(p => path.startsWith(p))) return null;

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim()
          || req.headers.get('x-real-ip')
          || 'unknown';
  const isAI = path.startsWith('/api/vision-analyze') || path.startsWith('/api/text-analyze');
  const limit = isAI ? LIMIT_VISION : LIMIT_DEFAULT;
  const bucket = isAI ? buckets.vision : buckets.default;

  const now = Date.now();
  const timestamps = (bucket.get(ip) || []).filter(t => now - t < WINDOW_MS);
  if (timestamps.length >= limit) {
    return NextResponse.json(
      { error: `Quá nhiều request${isAI ? ' tới AI' : ''}. Vui lòng đợi 1 phút.` },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }
  timestamps.push(now);
  bucket.set(ip, timestamps);

  if (bucket.size > 1000) {
    for (const [key, val] of bucket.entries()) {
      const recent = val.filter(t => now - t < WINDOW_MS);
      if (recent.length === 0) bucket.delete(key);
      else bucket.set(key, recent);
    }
  }
  return null;
}

// Làm mới session cookie Supabase trên các route trang (no-op nếu chưa cấu hình env).
async function refreshSupabaseSession(req) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.next({ request: req });

  let res = NextResponse.next({ request: req });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });
  await supabase.auth.getUser();
  return res;
}

export async function middleware(req) {
  if (req.nextUrl.pathname.startsWith('/api/')) {
    return rateLimit(req) || NextResponse.next();
  }
  return refreshSupabaseSession(req);
}

export const config = {
  // Chạy trên mọi route trừ static assets (cần cho cả rate-limit API lẫn refresh session trang).
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
  ],
};
