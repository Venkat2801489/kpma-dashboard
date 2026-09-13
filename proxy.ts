import { NextRequest, NextResponse } from "next/server";
import { cookieNameFor, verifySessionToken } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/workers") && pathname !== "/workers/login") {
    const token = request.cookies.get(cookieNameFor("worker"))?.value;
    const valid = token ? await verifySessionToken(token, "worker") : false;
    if (!valid) {
      const url = request.nextUrl.clone();
      url.pathname = "/workers/login";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard")) {
    const token = request.cookies.get(cookieNameFor("main"))?.value;
    const valid = token ? await verifySessionToken(token, "main") : false;
    if (!valid) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/workers/:path*"],
};
