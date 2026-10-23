import { NextResponse, type NextRequest } from "next/server";
import { getSession, verifyAdminRequest } from "./auth";
import { db } from "./db";

export async function requireAdminContext(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return {
      response: NextResponse.json(
        { error: auth.error || "Yêu cầu quyền Quản trị viên!" },
        { status: 403 }
      ),
    };
  }

  const session = await getSession();
  const admin = session?.role === "ADMIN"
    ? { id: session.id, name: session.name }
    : await db.user.findFirst({
        where: { role: "ADMIN", status: "ACTIVE" },
        select: { id: true, username: true, profile: { select: { displayName: true } } },
      });

  if (!admin) {
    return {
      response: NextResponse.json(
        { error: "Chưa cấu hình tài khoản quản trị hoạt động." },
        { status: 503 }
      ),
    };
  }

  return {
    auth,
    adminId: admin.id,
    adminName: auth.adminName || ("name" in admin ? admin.name : admin.profile?.displayName || admin.username),
  };
}

export async function writeAdminAudit(data: {
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  details?: unknown;
}) {
  await db.adminAuditLog.create({
    data: {
      adminId: data.adminId,
      action: data.action,
      targetType: data.targetType,
      targetId: data.targetId,
      details: data.details as object | undefined,
    },
  });
}
