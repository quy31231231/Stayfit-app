import { NextResponse } from 'next/server';

const requests = new Map();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;

export function middleware(req) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim()
          || req.headers.get('x-real-ip')
          || 'unknown';

  const now = Date.now();
  const timestamps = (requests.get(ip) || []).filter(t => now - t < WINDOW_MS);

  if (timestamps.length >= MAX_REQUESTS) {
    return NextResponse.json(
      { error: 'Quá nhiều request. Vui lòng đợi 1 phút.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }

  timestamps.push(now);
  requests.set(ip, timestamps);

  if (requests.size > 1000) {
    for (const [key, val] of requests.entries()) {
      const recent = val.filter(t => now - t < WINDOW_MS);
      if (recent.length === 0) requests.delete(key);
      else requests.set(key, recent);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/sync/:path*', '/api/save-meal/:path*'],
};
