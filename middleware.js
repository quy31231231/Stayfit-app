import { NextResponse } from 'next/server';

// Per-route-type rate limit buckets. In-memory only (sufficient for personal app).
const buckets = {
  default: new Map(),
  vision:  new Map(),
};

const WINDOW_MS = 60_000;
const LIMIT_DEFAULT = 30;
const LIMIT_VISION  = 10;  // Vision API tốn hơn, limit chặt hơn

export function middleware(req) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim()
          || req.headers.get('x-real-ip')
          || 'unknown';

  const isAI = req.nextUrl.pathname.startsWith('/api/vision-analyze')
            || req.nextUrl.pathname.startsWith('/api/text-analyze');
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

  // Cleanup buckets to avoid memory leaks
  if (bucket.size > 1000) {
    for (const [key, val] of bucket.entries()) {
      const recent = val.filter(t => now - t < WINDOW_MS);
      if (recent.length === 0) bucket.delete(key);
      else bucket.set(key, recent);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/sync/:path*',
    '/api/save-meal/:path*',
    '/api/vision-analyze/:path*',
    '/api/text-analyze/:path*',
  ],
};
