import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdminContext, writeAdminAudit } from "@/lib/admin";
import { serializeAdminUser } from "@/lib/admin-read-model";

export async function POST(req: NextRequest) {
  try {
    const context = await requireAdminContext(req);
    if (context.response) return context.response;

    const body = await req.json();
    const { userId, badgeId, action = "assign" } = body;

    if (!userId || !badgeId) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp đầy đủ userId và badgeId!" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: { profile: true, authorProfile: true, badges: { select: { badgeId: true } } },
    });
    const badge = await db.badge.findUnique({ where: { id: badgeId } });

    if (!user || !badge) {
      return NextResponse.json(
        { error: "Không tìm thấy người dùng hoặc danh hiệu!" },
        { status: 404 }
      );
    }

    if (action === "remove") {
      await db.userBadge.deleteMany({ where: { userId, badgeId } });
      await writeAdminAudit({
        adminId: context.adminId,
        action: "REMOVE_BADGE",
        targetType: "BADGE",
        targetId: badgeId,
        details: { userId },
      });
      return NextResponse.json({
        success: true,
        message: `Đã thu hồi danh hiệu "${badge.name}" từ ${user.profile?.displayName || user.username}!`,
        user: serializeAdminUser({
          ...user,
          badges: user.badges.filter((entry) => entry.badgeId !== badgeId),
        }),
      });
    } else {
      await db.userBadge.upsert({
        where: { userId_badgeId: { userId, badgeId } },
        update: {},
        create: { userId, badgeId },
      });
      await writeAdminAudit({
        adminId: context.adminId,
        action: "ASSIGN_BADGE",
        targetType: "BADGE",
        targetId: badgeId,
        details: { userId },
      });
      return NextResponse.json({
        success: true,
        message: `Đã trao tặng danh hiệu "${badge.name}" cho ${user.profile?.displayName || user.username}!`,
        user: serializeAdminUser({
          ...user,
          badges: user.badges.some((entry) => entry.badgeId === badgeId)
            ? user.badges
            : [...user.badges, { badgeId }],
        }),
      });
    }
  } catch (error) {
    console.error("Assign Badge Error:", error);
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "Danh hiệu đã được gán cho người dùng này." }, { status: 409 });
    }
    return NextResponse.json({ error: "Lỗi máy chủ khi gán danh hiệu!" }, { status: 500 });
  }
}
