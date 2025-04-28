import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const allowedOrigins =
    process.env.NODE_ENV === 'production'
      ? ['https://browser.falkordb.com']
      : ['http://localhost:3000', 'https://browser.falkordb.com'];

  const requestOrigin = req.headers.get('origin') || '';

  if (req.nextUrl.pathname.startsWith('/api/')) {
    if (allowedOrigins.includes(requestOrigin)) {
      res.headers.set('Access-Control-Allow-Origin', requestOrigin);
    }
    res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  return res;
}

export const config = {
  matcher: '/api/:path*',
};