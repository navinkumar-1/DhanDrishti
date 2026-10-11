import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("request_token");
  if (!token || request.nextUrl.pathname === "/api/brokers/zerodha/callback") {
    return NextResponse.next();
  }

  const callback = request.nextUrl.clone();
  callback.pathname = "/api/brokers/zerodha/callback";
  return NextResponse.redirect(callback);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
