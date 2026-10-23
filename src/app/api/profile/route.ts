import { NextResponse, type NextRequest } from "next/server";
import {
  getSession,
  hashPassword,
  setSessionCookie,
  verifyPassword,
  type SessionUser,
} from "@/lib/auth";
import { db } from "@/lib/db";
import { userRepository } from "@/lib/repositories";

type ProfileUser = Awaited<ReturnType<typeof userRepository.findUserById>>;

function toSessionUser(user: NonNullable<ProfileUser>): SessionUser {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.profile?.displayName || user.username,
    role: user.role as SessionUser["role"],
    status: user.status as SessionUser["status"],
    sessionVersion: user.sessionVersion,
    avatarUrl: user.profile?.avatarUrl || undefined,
    penName: user.authorProfile?.penName || undefined,
  };
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Chưa đăng nhập!" }, { status: 401 });

  const user = await userRepository.findUserById(session.id);
  if (!user) return NextResponse.json({ error: "Không tìm thấy hồ sơ." }, { status: 404 });

  return NextResponse.json({
    success: true,
    user: {
      ...toSessionUser(user),
      bio: user.profile?.bio || "",
      createdAt: user.createdAt.toISOString(),
      badges: [],
      readingStats: {
        hoursRead: 0,
        wordsRead: 0,
        chaptersRead: 0,
        streakDays: 0,
        cultivationRank: user.role === "ADMIN" ? "Hóa Thần Thư Thánh" : "Trúc Cơ Tu Sĩ",
      },
    },
  });
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Chưa đăng nhập!" }, { status: 401 });

    const current = await userRepository.findUserById(session.id);
    if (!current) return NextResponse.json({ error: "Không tìm thấy hồ sơ." }, { status: 404 });

    const body = await req.json();
    const requestedName = typeof body.name === "string" ? body.name.trim() : undefined;
    const currentName = current.profile?.displayName || current.username;

    if (requestedName && requestedName !== currentName && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Chỉ Admin được sửa tên hiển thị." }, { status: 403 });
    }

    let passwordHash: string | undefined;
    if (body.newPassword !== undefined) {
      if (typeof body.newPassword !== "string" || body.newPassword.length < 6) {
        return NextResponse.json({ error: "Mật khẩu mới phải có tối thiểu 6 ký tự!" }, { status: 400 });
      }
      if (
        typeof body.oldPassword !== "string" ||
        !(await verifyPassword(body.oldPassword, current.passwordHash))
      ) {
        return NextResponse.json({ error: "Mật khẩu hiện tại không chính xác!" }, { status: 400 });
      }
      passwordHash = await hashPassword(body.newPassword);
    }

    const upgradeToAuthor = Boolean(body.upgradeToAuthor && current.role === "READER");
    const role = upgradeToAuthor ? "AUTHOR" : current.role;
    const displayName = requestedName || currentName;
    const bio = typeof body.bio === "string" ? body.bio.trim() : current.profile?.bio || null;
    const avatarUrl =
      typeof body.avatarUrl === "string" ? body.avatarUrl.trim() : current.profile?.avatarUrl || null;
    const penName =
      typeof body.penName === "string" && body.penName.trim()
        ? body.penName.trim()
        : current.authorProfile?.penName || displayName;

    const updated = await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: current.id },
        data: {
          role,
          ...(passwordHash
            ? { passwordHash, sessionVersion: { increment: 1 } }
            : {}),
        },
      });

      await tx.profile.upsert({
        where: { userId: current.id },
        update: { displayName, bio, avatarUrl },
        create: { userId: current.id, displayName, bio, avatarUrl },
      });

      if (role === "AUTHOR" || role === "ADMIN") {
        await tx.authorProfile.upsert({
          where: { userId: current.id },
          update: { penName, avatarUrl },
          create: { userId: current.id, penName, avatarUrl },
        });
      }

      return tx.user.findUnique({
        where: { id: current.id },
        include: { profile: true, authorProfile: true },
      });
    });

    if (!updated) return NextResponse.json({ error: "Không thể cập nhật hồ sơ." }, { status: 500 });

    const nextSession = toSessionUser(updated);
    await setSessionCookie(nextSession);
    return NextResponse.json({
      success: true,
      message: upgradeToAuthor
        ? "Bạn đã trở thành Tác giả Mộc Thư."
        : "Cập nhật hồ sơ thành công.",
      user: {
        ...nextSession,
        bio: updated.profile?.bio || "",
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Lỗi máy chủ khi cập nhật hồ sơ!" }, { status: 500 });
  }
}
