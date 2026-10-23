# Mộc Thư Production Security Specification

This document details security controls, session lifecycle management, and defense-in-depth practices implemented across the Mộc Thư backend.

---

## 1. Authentication & Session Security

- **Session Tokens**: Signed JSON Web Tokens (HS256) stored in `HttpOnly` cookies.
- **Production Cookie Directives**:
  - `httpOnly: true`: Blocks client-side JavaScript access (`document.cookie`), mitigating XSS session theft.
  - `secure: true`: Enforced in production (`process.env.NODE_ENV === "production"`), transmitting cookies solely over HTTPS.
  - `sameSite: "lax"`: Prevents CSRF on cross-site subrequests while permitting top-level navigation.
  - `path: "/"`: Restricts scope to application root.
  - `maxAge: 30 * 24 * 60 * 60`: 30-day session lifespan.
- **Server-Side Revocation**: Every session verification validates `sessionVersion` against the database `User.sessionVersion`. Logout, password change, account suspension, or ban immediately increments `sessionVersion`, revoking all active sessions across devices.

---

## 2. Admin API Authorization & Hardening

- **API Key Comparison**: Admin key checks use Node.js `crypto.timingSafeEqual` via constant-time buffer comparison to prevent timing attacks.
- **No In-Memory Secret Mutation**: Admin key rotation is managed externally via deployment environment variables (`ADMIN_API_KEY`). Runtime rotation endpoints return `405 Method Not Allowed`.
- **RBAC Enforcement**: All `/api/admin/*` endpoints invoke `requireAdminContext(req)`:
  - Validates valid `ADMIN_API_KEY` header (`x-api-key` / `Authorization: Bearer <key>`) OR active session with `role === "ADMIN"`.
  - Rejects guest and non-admin requests with `403 Forbidden`.
  - Automatically records audit trails into `AdminAuditLog` with `adminId`, `action`, `targetType`, `targetId`, and metadata.

---

## 3. Database & Injection Defenses

- **Query Parameterization**: All repository queries (`storyRepository`, `chapterRepository`, `userRepository`) utilize Prisma Client with prepared statements, preventing SQL injection.
- **Conflict & Error Mapping**: Prisma database errors are mapped explicitly:
  - `P2002` -> `409 Conflict` (slug, username, email, chapterNumber collisions).
  - `P2025` -> `404 Not Found` (missing records during update/delete).
  - Raw database errors, connection strings, and stack traces are suppressed from client responses.

---

## 4. Redirect Safety & Open-Redirect Prevention

- **Safe Redirect Validation**:
  ```ts
  function safeRedirect(value: string | null): string {
    if (!value || !value.startsWith("/") || value.startsWith("//")) return "/login";
    return value;
  }
  ```
  Prevents external open-redirect attacks during login/logout workflows.

---

## 5. Health Monitoring & Config Assertion

- **Fail-Fast Startup**: `assertProductionConfig()` checks presence of `DATABASE_URL`, `JWT_SECRET`, and `ADMIN_API_KEY` in production.
- **Health Check (`GET /api/health`)**: Executes `SELECT 1` without returning sensitive connection parameters or schema details. Returns `503 Service Unavailable` if database is down.
