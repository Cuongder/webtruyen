import { db } from "../db";
import type { Role, UserStatus } from "@prisma/client";

// ponytail: Basic user repo querying relational tables; upgrade to caching layer (Redis) when traffic scales.

export async function findUserById(id: string) {
  return db.user.findUnique({
    where: { id },
    include: {
      profile: true,
      authorProfile: true,
    },
  });
}

export async function findUserByEmail(email: string) {
  return db.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    include: {
      profile: true,
      authorProfile: true,
    },
  });
}

export async function findUserByUsername(username: string) {
  return db.user.findUnique({
    where: { username: username.toLowerCase().trim() },
    include: {
      profile: true,
      authorProfile: true,
    },
  });
}

export async function findUserByEmailOrUsername(identifier: string) {
  const clean = identifier.toLowerCase().trim();
  return db.user.findFirst({
    where: {
      OR: [
        { email: { equals: clean, mode: "insensitive" } },
        { username: { equals: clean, mode: "insensitive" } },
      ],
    },
    include: {
      profile: true,
      authorProfile: true,
    },
  });
}

export async function getUserSessionVerification(userId: string) {
  return db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      status: true,
      sessionVersion: true,
      profile: {
        select: {
          displayName: true,
          avatarUrl: true,
        },
      },
      authorProfile: {
        select: {
          penName: true,
        },
      },
    },
  });
}

export async function createUser(data: {
  email: string;
  username: string;
  passwordHash: string;
  role?: Role;
  displayName?: string;
  penName?: string;
  avatarUrl?: string;
}) {
  const role = data.role || "READER";
  const name = data.displayName || data.username;
  const penName = data.penName || (role === "AUTHOR" ? name : undefined);

  return db.user.create({
    data: {
      email: data.email.toLowerCase().trim(),
      username: data.username.toLowerCase().trim(),
      passwordHash: data.passwordHash,
      role,
      status: "ACTIVE",
      sessionVersion: 1,
      profile: {
        create: {
          displayName: name,
          avatarUrl: data.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
        },
      },
      ...(role === "AUTHOR" && penName
        ? {
            authorProfile: {
              create: {
                penName,
                avatarUrl: data.avatarUrl,
              },
            },
          }
        : {}),
    },
    include: {
      profile: true,
      authorProfile: true,
    },
  });
}

export async function incrementSessionVersion(userId: string) {
  return db.user.update({
    where: { id: userId },
    data: {
      sessionVersion: {
        increment: 1,
      },
    },
  });
}

export async function updateUserStatus(userId: string, status: UserStatus) {
  return db.user.update({
    where: { id: userId },
    data: {
      status,
      sessionVersion: {
        increment: 1,
      },
    },
  });
}
