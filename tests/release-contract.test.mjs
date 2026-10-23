import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { test } from "node:test";
import { relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

async function source(relativePath) {
  return readFile(resolve(root, relativePath), "utf8");
}

async function sourceFiles(relativeDir) {
  const files = [];
  const absoluteDir = resolve(root, relativeDir);

  async function walk(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const absolutePath = resolve(directory, entry.name);
      if (entry.isDirectory()) {
        await walk(absolutePath);
      } else if (/\.(?:[cm]?[jt]sx?)$/.test(entry.name)) {
        files.push(relative(root, absolutePath));
      }
    }
  }

  await walk(absoluteDir);
  return files.sort();
}

test("session auth has server-side revocation evidence", async () => {
  const auth = await source("src/lib/auth.ts");
  const logout = await source("src/app/api/auth/logout/route.ts");

  assert.match(auth, /jti|revok|sessionVersion|tokenVersion/i);
  assert.match(logout, /revokeCurrentSession|revokeUserSessions/i);
});

test("public story reads enforce publication policy", async () => {
  const stories = await source("src/app/api/stories/route.ts");
  const storyById = await source("src/app/api/stories/[id]/route.ts");
  const chapters = await source("src/app/api/stories/[id]/chapters/route.ts");

  assert.match(stories, /visibility:\s*["']PUBLIC["']/);
  assert.match(storyById, /canReadStory/);
  assert.match(chapters, /PUBLISHED|status\s*!==\s*["']DRAFT["']/);
});

test("library storage is scoped to signed-in user", async () => {
  const actions = await source("src/components/story/StoryActions.tsx");
  const library = await source("src/app/library/page.tsx");
  const endpoint = await source("src/app/api/library/route.ts");

  assert.match(actions, /api\/library/);
  assert.doesNotMatch(actions, /mocthu_library_list/);
  assert.match(library, /api\/library/);
  assert.match(endpoint, /requireAuth/);
});

test("story and chapter mutations enforce owner-or-admin authorization", async () => {
  const story = await source("src/app/api/stories/[id]/route.ts");
  const chapters = await source("src/app/api/stories/[id]/chapters/route.ts");

  assert.match(story, /canManageStory/);
  assert.match(chapters, /canManageChapter/);
});

test("smoke support covers required route families", async () => {
  const smoke = await source("scripts/smoke-check.mjs");

  for (const route of [
    '"/"',
    '"/api/stories"',
    '"/library"',
    '"/admin"',
    '"/api/auth"',
    '"/api/profile"',
    '"/api/auth/logout"',
  ]) {
    assert.match(smoke, new RegExp(route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("runtime source has no executable data-store imports", async () => {
  const runtimeFiles = [
    ...(await sourceFiles("src/app")),
    ...(await sourceFiles("src/components")),
    ...(await sourceFiles("src/lib")),
  ];
  const violations = [];

  for (const file of runtimeFiles) {
    const text = await source(file);
    if (
      /^\s*import\s+(?!type\b)[^;]*from\s+["'][^"']*data-store["']/m.test(text) ||
      /\brequire\(\s*["'][^"']*data-store["']\s*\)/.test(text)
    ) {
      violations.push(file);
    }
  }

  assert.deepEqual(
    violations,
    [],
    `runtime data-store imports found:\n${violations.join("\n")}`
  );
});

test("every admin API route uses shared authorization and DB-backed data", async () => {
  const adminFiles = await sourceFiles("src/app/api/admin");
  const violations = [];

  for (const file of adminFiles) {
    const text = await source(file);
    if (!text.includes("requireAdminContext")) {
      violations.push(`${file}: missing requireAdminContext`);
    }
    if (text.includes("data-store")) {
      violations.push(`${file}: imports data-store`);
    }
  }

  assert.deepEqual(
    violations,
    [],
    `admin route contract violations:\n${violations.join("\n")}`
  );
});

test("all logout entrypoints revoke server sessions", async () => {
  const auth = await source("src/app/api/auth/route.ts");
  const logout = await source("src/app/api/auth/logout/route.ts");

  assert.match(auth, /\brevokeUserSessions\b/);
  assert.match(auth, /action === ["']logout["'][\s\S]{0,800}\brevokeUserSessions\b/);
  assert.match(logout, /\brevokeUserSessions\b/);
});

test("session cookies use production-safe flags", async () => {
  const auth = await source("src/lib/auth.ts");

  assert.match(auth, /httpOnly:\s*true/);
  assert.match(auth, /secure:\s*process\.env\.NODE_ENV\s*===\s*["']production["']/);
  assert.match(auth, /sameSite:\s*["']lax["']/);
  assert.match(auth, /path:\s*["']\/["']/);
});

test("admin API key endpoint does not expose or rotate process-local secrets", async () => {
  const route = await source("src/app/api/admin/api-key/route.ts");

  assert.match(route, /\b405\b/);
  assert.doesNotMatch(route, /\bapiKey:\s*(?:currentKey|newKey)\b/);
  assert.doesNotMatch(route, /\b(?:regenerateAdminApiKey|setAdminApiKey)\b/);
});

test("story and chapter mutations map database conflicts instead of returning generic 500", async () => {
  const mutationRoutes = [
    "src/app/api/stories/route.ts",
    "src/app/api/stories/[id]/route.ts",
    "src/app/api/stories/[id]/chapters/route.ts",
    "src/app/api/chapters/[id]/route.ts",
  ];

  for (const route of mutationRoutes) {
    const text = await source(route);
    assert.match(text, /P2002|409/, `${route} lacks conflict mapping`);
    assert.match(text, /P2025|404/, `${route} lacks not-found mapping`);
  }
});

test("smoke auth uses injected synthetic credentials", async () => {
  const smoke = await source("scripts/smoke-check.mjs");

  assert.match(smoke, /process\.env\.SMOKE_EMAIL/);
  assert.match(smoke, /process\.env\.SMOKE_PASSWORD/);
  assert.doesNotMatch(smoke, /reader@mocthu\.vn|mocthu123/);
});
