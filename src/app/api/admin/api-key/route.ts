import { NextResponse, type NextRequest } from "next/server";
import { getAdminApiKey } from "@/lib/auth";
import { requireAdminContext } from "@/lib/admin";

export async function GET(req: NextRequest) {
  const context = await requireAdminContext(req);
  if (context.response) return context.response;

  return NextResponse.json({
    success: true,
    configured: Boolean(getAdminApiKey()),
    authMethod: context.auth.authMethod,
    headerName: "x-api-key",
  });
}

export async function POST() {
  return NextResponse.json(
    { error: "API key quản trị cấu hình ngoài deploy; đổi trong secret manager rồi redeploy." },
    { status: 405, headers: { Allow: "GET" } }
  );
}
