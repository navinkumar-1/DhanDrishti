import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { exchangeUpstoxCode, isValidUpstoxState, nextUpstoxExpiry } from "@/lib/brokers/upstox";
import { encryptSecret } from "@/lib/security/token-encryption";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const failed = new URL("/connect/upstox?error=upstox", url.origin);

  if (error || !code) return NextResponse.redirect(failed);

  const expectedState = (await cookies()).get("upstox_oauth_state")?.value;
  if (!expectedState || !returnedState || expectedState !== returnedState || !isValidUpstoxState(returnedState)) {
    return NextResponse.redirect(failed);
  }

  try {
    const session = await exchangeUpstoxCode(code);
    const sealed = encryptSecret(session.accessToken);
    const packed = Buffer.from(
      JSON.stringify({
        ...sealed,
        expiresAt: nextUpstoxExpiry(),
        userId: session.userId ?? null,
      }),
    ).toString("base64url");

    const response = NextResponse.redirect(new URL("/dashboard?upstox=connected", url.origin));
    response.cookies.set("dd_upstox", packed, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 18,
    });
    response.cookies.set("upstox_oauth_state", "", { httpOnly: true, path: "/", maxAge: 0 });
    return response;
  } catch (caught) {
    console.error("Upstox callback failed", caught instanceof Error ? caught.message : "Unknown error");
    return NextResponse.redirect(failed);
  }
}
