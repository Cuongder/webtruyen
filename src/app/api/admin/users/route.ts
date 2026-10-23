import { NextResponse, type NextRequest } from "next/server";
import { hashPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireAdminContext, writeAdminAudit } from "@/lib/admin";
import { serializeAdminUser } from "@/lib/admin-read-model";

export async function GET(req: NextRequest) {
  const context = await requireAdminContext(req);
  if (context.response) return context.response;

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("q")?.trim();
  const role = searchParams.get("role");
  const status = searchParams.get("status");
  const users = await db.user.findMany({
    where: {
      ...(search
        ? {
            OR: [
              { email: { contains: search, mode: "insensitive" } },
              { username: { contains: search, mode: "insensitive" } },
              { profile: { displayName: { contains: search, mode: "insensitive" } } },
              { authorProfile: { penName: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {}),
      ...(role ? { role: role as any } : {}),
      ...(status ? { status: status as any } : {}),
    },
    include: {
      profile: true,
      authorProfile: true,
      badges: { select: { badgeId: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  const list = users.map(serializeAdminUser);

  return NextResponse.json({
    success: true,
    total: list.length,
    users: list,
  });
}

export async function POST(req: NextRequest) {
  try {
    const context = await requireAdminContext(req);
    if (context.response) return context.response;

    const body = await req.json();
    const { email, username, name, role = "READER", penName, bio } = body;

    if (!email || !username || !name) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ Email, Username và Tên hiển thị!" },
        { status: 400 }
      );
    }

    if (!["READER", "AUTHOR", "ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Role không hợp lệ!" }, { status: 400 });
    }

    const password = body.password || process.env.SEED_DEFAULT_USER_PASSWORD;
    if (!password || password.length < 12) {
      return NextResponse.json(
        { error: "Cần truyền password tối thiểu 12 ký tự khi tạo tài khoản." },
        { status: 400 }
      );
    }

    const newUser = await db.user.create({
      data: {
        email: email.toLowerCase().trim(),
        username: username.toLowerCase().trim(),
        passwordHash: await hashPassword(password),
        role,
        profile: { create: { displayName: name, bio: bio || undefined } },
        ...(role === "AUTHOR"
          ? { authorProfile: { create: { penName: penName || name, bio: bio || undefined } } }
          : {}),
      },
      include: { profile: true, authorProfile: true, badges: { select: { badgeId: true } } },
    });
    const serialized = serializeAdminUser(newUser);
    await writeAdminAudit({
      adminId: context.adminId,
      action: "CREATE_USER",
      targetType: "USER",
      targetId: newUser.id,
      details: { username: newUser.username },
    });

    return NextResponse.json({
      success: true,
      message: `Đã tạo thành công tài khoản "${serialized.name}"!`,
      user: serialized,
    });
  } catch (error) {
    console.error("Create User Error:", error);
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "Email hoặc tên người dùng đã tồn tại." }, { status: 409 });
    }
    return NextResponse.json({ error: "Lỗi máy chủ khi tạo người dùng!" }, { status: 500 });
  }
}
