import { NextResponse } from "next/server";
import { listBrokers } from "@/server/brokers/service";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ data: listBrokers() });
}
