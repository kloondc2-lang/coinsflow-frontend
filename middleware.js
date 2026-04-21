import { NextResponse } from 'next/server';

// Cloudflare appends these tokens to URLs after bot-challenge verification.
// Strip them so users always see clean URLs.
const CF_PARAMS = ['__cf_chl_tk', '__cf_chl_rt_tk', 'cf_chl_captcha_tk'];

export function middleware(request) {
  const { searchParams, pathname } = request.nextUrl;

  const dirty = CF_PARAMS.some((p) => searchParams.has(p));
  if (!dirty) return NextResponse.next();

  const clean = request.nextUrl.clone();
  CF_PARAMS.forEach((p) => clean.searchParams.delete(p));

  return NextResponse.redirect(clean, { status: 301 });
}

export const config = {
  // Run on all non-static, non-api paths
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
 