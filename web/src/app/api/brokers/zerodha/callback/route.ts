import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { encryptToken } from "@/server/brokers/core";

export const dynamic = "force-dynamic";

const COOKIE = "dd_kite";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const requestToken = url.searchParams.get("request_token");
  const status = url.searchParams.get("status");
  const failed = new URL("/connect/zerodha?error=auth", url.origin);

  if (status !== "success" || !requestToken) {
    return NextResponse.redirect(failed);
  }

  const apiKey = process.env.KITE_API_KEY;
  const apiSecret = process.env.KITE_API_SECRET;
  if (!apiKey || !apiSecret) {
    return NextResponse.json({ error: "Zerodha is not configured" }, { status: 500 });
  }

  const checksum = createHash("sha256").update(apiKey + requestToken + apiSecret).digest("hex");
  const body = new URLSearchParams({
    api_key: apiKey,
    request_token: requestToken,
    checksum,
  });

  const response = await fetch("https://api.kite.trade/session/token", {
    method: "POST",
    headers: {
      "X-Kite-Version": "3",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  if (!response.ok) {
    console.error("Zerodha token exchange failed", { status: response.status });
    return NextResponse.redirect(failed);
  }

  const data = (await response.json()) as { data?: { access_token?: string } };
  const accessToken = data.data?.access_token;
  if (!accessToken) {
    return NextResponse.redirect(failed);
  }

  const sealed = encryptToken(accessToken);
  const next = NextResponse.redirect(new URL("/dashboard?zerodha=connected", url.origin));
  next.cookies.set(COOKIE, `${sealed.iv}.${sealed.ciphertext}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 18,
  });
  return next;
}
