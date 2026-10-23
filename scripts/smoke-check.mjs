import assert from "node:assert/strict";

const baseUrl = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const smokeEmail = process.env.SMOKE_EMAIL || "";
const smokePassword = process.env.SMOKE_PASSWORD || "";

function cookieHeader(response) {
  const cookies = response.headers.getSetCookie?.() || [];
  return cookies
    .map((value) => value.split(";", 1)[0])
    .filter(Boolean)
    .join("; ");
}

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    redirect: "manual",
    ...options,
    headers: {
      ...(options.body ? { "content-type": "application/json" } : {}),
      ...options.headers,
    },
  });
  return response;
}

async function assertBaseUrlReachable() {
  try {
    await request("/");
    return true;
  } catch (error) {
    console.error(`BLOCKED BASE_URL ${baseUrl}`);
    console.error(error instanceof Error ? error.message : error);
    return false;
  }
}

async function json(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

const checks = [];
function check(name, fn) {
  checks.push({ name, fn });
}

if (!(await assertBaseUrlReachable())) {
  process.exitCode = 2;
  process.exit();
}

if (!smokeEmail || !smokePassword) {
  console.error("BLOCKED SMOKE_EMAIL and SMOKE_PASSWORD are required for session smoke checks");
  process.exitCode = 2;
  process.exit();
}

check("home route", async () => {
  const response = await request("/");
  assert.equal(response.status, 200);
});

check("public story API", async () => {
  const response = await request("/api/stories");
  assert.equal(response.status, 200);
  const body = await json(response);
  assert.equal(body.success, true);
  assert.ok(Array.isArray(body.stories));
  assert.ok(body.stories.length > 0);
  return body.stories[0];
});

check("library route", async () => {
  const response = await request("/library");
  assert.equal(response.status, 200);
});

check("protected admin route redirects guests", async () => {
  const response = await request("/admin");
  assert.equal(response.status, 307);
  assert.match(response.headers.get("location") || "", /\/login$/);
});

check("guest mutation guards", async () => {
  const storyResponse = await request("/api/stories", {
    method: "POST",
    body: JSON.stringify({
      title: "QA synthetic story",
      shortDescription: "Synthetic smoke payload",
      coverUrl: "https://example.invalid/cover.jpg",
    }),
  });
  assert.equal(storyResponse.status, 403);

  const chaptersResponse = await request("/api/stories/story-1/chapters", {
    method: "POST",
    body: JSON.stringify({ title: "QA", content: "Synthetic smoke payload" }),
  });
  assert.equal(chaptersResponse.status, 401);
});

check("protected APIs reject guests", async () => {
  for (const path of [
    "/api/admin/api-key",
    "/api/admin/badges",
    "/api/admin/genres",
    "/api/admin/users",
    "/api/admin/stories",
    "/api/admin/chapters",
  ]) {
    const response = await request(path);
    assert.equal(response.status, 403, `${path} must reject guest`);
  }

  for (const path of [
    "/api/profile",
    "/api/library",
    "/api/bookmarks",
    "/api/reading-progress",
  ]) {
    const response = await request(path);
    assert.equal(response.status, 401, `${path} must reject guest`);
  }
});

check("auth validates malformed input", async () => {
  const response = await request("/api/auth", {
    method: "POST",
    body: JSON.stringify({ action: "login" }),
  });
  assert.equal(response.status, 400);
  const body = await json(response);
  assert.equal(body.passwordHash, undefined);
});

check("login/profile/logout session journey", async () => {
  const login = await request("/api/auth", {
    method: "POST",
    body: JSON.stringify({
      action: "login",
      email: smokeEmail,
      password: smokePassword,
    }),
  });
  assert.equal(login.status, 200);
  const sessionCookie = cookieHeader(login);
  assert.match(sessionCookie, /mocthu_session=/);

  const profile = await request("/api/profile", {
    headers: { cookie: sessionCookie },
  });
  assert.equal(profile.status, 200);
  const profileBody = await json(profile);
  assert.equal(profileBody.user.email, smokeEmail);
  assert.equal(profileBody.user.passwordHash, undefined);

  const logout = await request("/api/auth/logout", {
    method: "POST",
    headers: { cookie: sessionCookie },
    body: JSON.stringify({}),
  });
  assert.equal(logout.status, 200);

  const afterLogout = await request("/api/profile", {
    headers: { cookie: sessionCookie },
  });
  assert.equal(afterLogout.status, 401);
});

let failures = 0;
for (const { name, fn } of checks) {
  try {
    const result = await fn();
    console.log(`PASS ${name}`);
    if (result?.id) {
      const chapters = await request(`/api/stories/${result.id}/chapters`);
      assert.equal(chapters.status, 200);
      console.log("PASS story chapters route");
    }
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${name}`);
    console.error(error instanceof Error ? error.message : error);
  }
}

if (failures > 0) {
  console.error(`Smoke checks failed: ${failures}`);
  process.exitCode = 1;
} else {
  console.log(`Smoke checks passed: ${checks.length}`);
}
