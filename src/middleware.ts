import { auth } from "@/lib/auth/auth-options";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isAuthenticated = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith("/auth");

  // Redirect to signin if not authenticated and trying to access protected routes
  if (!isAuthenticated && !isAuthPage) {
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/home/:path*", "/add-word/:path*", "/all-words/:path*"],
};
