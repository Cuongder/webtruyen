import { NextResponse, type NextRequest } from "next/server";
import {
  getAdminApiKey,
  regenerateAdminApiKey,
  setAdminApiKey,
  verifyAdminRequest,
} from "@/lib/auth";
import { addAuditLog } from "@/lib/data-store";

export async function GET(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error || "Yêu cầu quyền Quản trị viên!" },
      { status: 403 }
    );
  }

  const currentKey = getAdminApiKey();
  return NextResponse.json({
    success: true,
    apiKey: currentKey,
    authMethod: auth.authMethod,
    headerName: "x-api-key",
    usageExample: {
      curl: `curl -H "x-api-key: ${currentKey}" http://localhost:3000/api/admin/stories`,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error || "Yêu cầu quyền Quản trị viên!" },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action || "regenerate";

    let newKey = "";
    if (action === "custom" && body.customKey) {
      newKey = setAdminApiKey(body.customKey);
    } else {
      newKey = regenerateAdminApiKey();
    }

    addAuditLog({
      adminId: "admin",
      adminName: auth.adminName,
      action: "REGENERATE_API_KEY",
      targetType: "USER",
      targetId: "admin-api-key",
      targetName: "Admin API Key",
      details: "Đã làm mới mã khóa xác thực API Key của Quản trị viên",
    });

    return NextResponse.json({
      success: true,
      message: "Đã làm mới mã khóa API Key Quản trị viên thành công!",
      apiKey: newKey,
    });
  } catch (error) {
    console.error("Regenerate API Key Error:", error);
    return NextResponse.json(
      { error: "Lỗi máy chủ khi làm mới API Key!" },
      { status: 500 }
    );
  }
}
