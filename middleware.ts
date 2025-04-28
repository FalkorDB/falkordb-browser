import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const allowedOrigins =
    process.env.NODE_ENV === 'production'
      ? ['https://browser.falkordb.com']
      : ['http://localhost:3000', 'https://browser.falkordb.com'];

  const requestOrigin = req.headers.get('origin') || '';

  if (req.nextUrl.pathname.startsWith('/api/')) {
    if (req.method === 'OPTIONS') {
      const preflight = new NextResponse(null, { status: 204 });
      if (allowedOrigins.includes(requestOrigin)) {
        preflight.headers.set('Access-Control-Allow-Origin', requestOrigin);
        preflight.headers.set('Access-Control-Allow-Credentials', 'true');
      }
      preflight.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
      preflight.headers.set('Access-Control-Allow-Headers', 'Content-Type,Authorization');
      preflight.headers.set('Access-Control-Max-Age', '86400');
      return preflight;
    }

    const res = NextResponse.next();
    if (allowedOrigins.includes(requestOrigin)) {
      res.headers.set('Access-Control-Allow-Origin', requestOrigin);
      res.headers.set('Access-Control-Allow-Credentials', 'true');
    }
    res.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};