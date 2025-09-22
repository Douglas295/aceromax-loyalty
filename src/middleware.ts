import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

interface TokenWithExp {
  exp?: number; // JWT expiration in seconds since epoch
  [key: string]: unknown;
}

function isValidToken(token: TokenWithExp | null): boolean {
  return !!(token && token.exp && token.exp * 1000 > Date.now());
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = (await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })) as TokenWithExp | null;

  // 🔹 Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!isValidToken(token)) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // 🔹 Prevent logged-in users from visiting login/register
  if (["/login", "/register"].includes(pathname)) {
    if (isValidToken(token)) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/register"],
};
