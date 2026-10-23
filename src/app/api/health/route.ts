import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assertProductionConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    assertProductionConfig();
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, service: "mocthu", database: "ok" });
  } catch (error) {
    console.error("Health check failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ ok: false, service: "mocthu", database: "unavailable" }, { status: 503 });
  }
}
