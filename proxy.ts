import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const GATED = ["/p", "/settings"];
const SESSION_COOKIES = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
];

function hasSession(req: NextRequest) {
  return SESSION_COOKIES.some((n) => req.cookies.has(n));
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!hasSession(req) && GATED.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
