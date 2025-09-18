import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (["/login", "/register"].includes(pathname)) {
    if (token) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }
  else{
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

// ✅ Only match the routes that might need auth handling
export const config = {
  matcher: ["/admin", "/admin/users", "/admin/users-crud", "/admin/branches", "/admin/branches-crud", "/login", "/register"],
};
