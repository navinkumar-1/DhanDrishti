import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { decryptToken } from "@/server/brokers/core";

export const dynamic = "force-dynamic";

export async function GET() {
  const sealed = (await cookies()).get("dd_kite")?.value;
  if (!sealed) return NextResponse.json({ data: { connected: false } });
  const [iv, ciphertext] = sealed.split(".");
  if (!iv || !ciphertext) return NextResponse.json({ data: { connected: false } });
  try {
    decryptToken({ iv, ciphertext });
    return NextResponse.json({ data: { connected: true } });
  } catch {
    return NextResponse.json({ data: { connected: false } });
  }
}
