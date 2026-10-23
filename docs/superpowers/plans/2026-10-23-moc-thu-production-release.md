# Mộc Thư Production Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chuyển Mộc Thư từ prototype có data-store/mock runtime sang ứng dụng đọc/sáng tác chạy production với PostgreSQL thật, auth an toàn, đầy đủ luồng người đọc/tác giả/admin, QA tự động và deploy Vercel có thể rollback.

**Architecture:** PostgreSQL + Prisma là nguồn dữ liệu duy nhất lúc runtime. Next.js Server Components/Route Handlers đọc ghi qua repository; UI client chỉ gọi API cho trạng thái người dùng như library, progress, bookmark. `src/lib/data-store.ts` chỉ còn được phép dùng trong seed/migration adapter hoặc bị xoá sau khi seed xác nhận.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Prisma 6, PostgreSQL managed, Vercel, Node `node:test`, Playwright smoke test.

---

## Trạng thái và nguyên tắc

- Worktree hiện tại: `C:\Users\Main\.codex\worktrees\moc-thu-complete\webtruyen`.
- Đã pass: `npm run lint` (đang trỏ tới TypeScript), `npm run test:qa`, `npx tsc --noEmit --incremental false`, `npm run build` khi có `DATABASE_URL` hợp lệ về mặt schema.
- Local PostgreSQL chưa chạy. Không seed/deploy bằng `localhost:5432`.
- Không public khi còn bất kỳ import runtime nào từ `STORIES_DATA`, `CHAPTERS_DATA`, `DEMO_USERS`, `BADGES_DATA`, `GENRES_DATA` hoặc mutation qua `data-store`.
- Không commit secret, demo password, admin key thật trong source/docs.
- Mỗi role chỉ một agent: NEXUS điều phối, FORGE backend, PIXEL frontend, SENTINEL QA, VORTEX review.

## File map

- `prisma/schema.prisma`, `prisma/migrations/`, `prisma/seed.ts`: model, migration, dữ liệu khởi tạo.
- `src/lib/db.ts`, `src/lib/repositories/`, `src/lib/read-model.ts`, `src/lib/story-mapper.ts`: data access và response adapter.
- `src/lib/auth.ts`, `src/lib/access-control.ts`, `src/app/api/auth/`, `src/app/api/profile/`: identity, session, authorization.
- `src/app/api/stories/`, `src/app/api/chapters/`, `src/app/api/library/`, `src/app/api/reading-progress/`, `src/app/api/bookmarks/`: core API.
- `src/app/api/admin/`: admin API; phải dùng Prisma và shared admin guard.
- `src/app/page.tsx`, `src/app/discover/`, `src/app/search/`, `src/app/genre/`, `src/app/story/`, `src/app/author/`, `src/app/library/`, `src/app/studio/`, `src/app/profile/`, `src/app/admin/`: production UI.
- `src/components/reader/`, `src/components/story/`, `src/components/studio/`: reader, library action, author editor.
- `tests/`, `scripts/smoke-check.mjs`, `playwright/` hoặc `tests/e2e/`: contract, API, browser smoke.
- `.env.example`, `vercel.json`, `docs/ops/`: deploy contract, env, runbook.

---

## Wave 0: Baseline và release contract

### Task 0.1: Chốt baseline

**Owner:** NEXUS  
**Files:** `docs/superpowers/plans/2026-10-23-moc-thu-production-release.md`, `package.json`, `tests/release-contract.test.mjs`

- [ ] Ghi commit/branch bắt đầu và giữ nguyên thay đổi người dùng.
- [ ] Chạy `npm ci`.
- [ ] Chạy `npm run lint`, `npm run test:qa`, `npx prisma validate`, `npx tsc --noEmit --incremental false`.
- [ ] Thêm contract test fail nếu `src/app` còn import runtime từ `data-store`.
- [ ] Commit checkpoint: `chore: establish production release baseline`.

### Task 0.2: Chuẩn hoá env contract

**Owner:** FORGE  
**Files:** `.env.example`, `src/lib/config.ts` (create), `src/app/api/health/route.ts` (create), `docs/ops/production-env.md` (create)

- [ ] Validate `DATABASE_URL`, `JWT_SECRET`, `ADMIN_API_KEY`, `NEXT_PUBLIC_SITE_URL` khi app start/request đầu tiên.
- [ ] Production thiếu secret trả lỗi cấu hình rõ ràng, không dùng fallback.
- [ ] Thêm `GET /api/health`: kiểm tra app, DB query `SELECT 1`, trả 503 khi DB lỗi; không leak URL/secret.
- [ ] Liệt kê env cần set trên Vercel và cách rotate.
- [ ] Test thiếu env và DB unavailable.
- [ ] Commit checkpoint.

---

## Wave 1: Database thật và migration

### Task 1.1: Tạo migration versioned

**Owner:** FORGE  
**Files:** `prisma/schema.prisma`, `prisma/migrations/*`, `package.json`

- [ ] Tạo migration PostgreSQL từ schema hiện tại, gồm `sessionVersion`, `featured`, unique/index.
- [ ] Thêm script `prisma:migrate:deploy`.
- [ ] Chạy `npx prisma migrate deploy` trên database staging, không dùng `db push` cho production.
- [ ] Kiểm tra foreign key cascade, unique `ReadingProgress`, unique `LibraryEntry`.
- [ ] Commit migration.

### Task 1.2: Seed một lần không tạo runtime coupling

**Owner:** FORGE  
**Files:** `prisma/seed.ts`, `prisma/seed-data.ts` (create), `src/lib/data-store.ts`

- [ ] Tách dữ liệu seed tối thiểu khỏi module runtime UI.
- [ ] Seed user với password hash ngẫu nhiên hoặc password do env seed cung cấp; không hardcode password production.
- [ ] Seed genres, stories, chapters, tags bằng `upsert`.
- [ ] Gắn đúng `authorId` DB, không dùng `author-1` giả.
- [ ] Chạy seed staging và kiểm tra số lượng record.
- [ ] Sau khi seed pass, cấm seed-data import trong `src/app` và `src/lib` runtime.

### Task 1.3: Chuyển toàn bộ core story/chapter API

**Owner:** FORGE  
**Files:** `src/app/api/stories/route.ts`, `src/app/api/stories/[id]/route.ts`, `src/app/api/stories/[id]/chapters/route.ts`, `src/app/api/chapters/[id]/route.ts`, `src/lib/repositories/*`

- [ ] GET public chỉ trả `PUBLIC` và chapter đã `PUBLISHED`/đến giờ publish.
- [ ] Owner/admin mới được sửa/xoá story/chapter.
- [ ] POST chapter dùng transaction, chapter number/slug unique, cập nhật `updatedAt`.
- [ ] Xử lý Prisma unique/not-found thành HTTP 409/404, không trả stack trace.
- [ ] Test guest, owner, non-owner, admin, draft, scheduled, trash.

---

## Wave 2: Auth, account, security

### Task 2.1: Hoàn tất auth persistence

**Owner:** FORGE  
**Files:** `src/app/api/auth/route.ts`, `src/lib/auth.ts`, `src/lib/repositories/user.repository.ts`

- [ ] Register tạo `User/Profile/AuthorProfile` trong transaction.
- [ ] Login chỉ trả public user fields; tuyệt đối không trả `passwordHash`.
- [ ] Login check `status`, role và `sessionVersion`.
- [ ] Logout POST revoke session version; GET chỉ redirect an toàn hoặc loại bỏ.
- [ ] Rate limit login/register theo IP + identifier bằng cơ chế production phù hợp.
- [ ] Test register -> logout -> login lại, duplicate email/username, suspended/banned, revoked session.

### Task 2.2: Đóng lỗ hổng admin key

**Owner:** FORGE  
**Files:** `src/lib/auth.ts`, `src/app/api/admin/api-key/route.ts`, `api.md`, `src/components/admin/AdminManagementDashboard.tsx`

- [ ] Xoá key mặc định và password/admin credential khỏi source/docs.
- [ ] Production chỉ nhận `ADMIN_API_KEY` từ secret manager; không runtime-generate key mất sau restart.
- [ ] API key rotation trong production dùng env/secret-manager workflow; endpoint runtime chỉ trả 405 nếu chưa có persistence an toàn.
- [ ] Shared `requireAdmin()` áp dụng cho mọi `/api/admin/*`, gồm GET metadata.
- [ ] Test guest, session admin, valid key, invalid key, missing production key.

### Task 2.3: Profile và account DB-backed

**Owner:** FORGE  
**Files:** `src/app/api/profile/route.ts`, `src/app/profile/page.tsx`, `src/lib/repositories/user.repository.ts`

- [ ] GET/PUT profile đọc ghi Prisma.
- [ ] Đổi password hash DB và increment `sessionVersion`.
- [ ] Upgrade reader -> author transactionally.
- [ ] Profile stats lấy từ DB aggregate hoặc hiển thị zero/empty rõ ràng; không bịa số.
- [ ] Test ownership, validation, password change, role upgrade.

---

## Wave 3: Public UI và reader

### Task 3.1: Loại bỏ mock khỏi public pages

**Owner:** PIXEL  
**Files:** `src/app/page.tsx`, `src/app/discover/page.tsx`, `src/app/search/page.tsx`, `src/app/genre/[slug]/page.tsx`, `src/app/story/[slug]/page.tsx`, `src/app/author/[username]/page.tsx`

- [ ] Mọi list/detail/genre/author lấy read model/API DB.
- [ ] Loading, empty, error state rõ ràng.
- [ ] Không fallback sang story/chapter giả khi DB rỗng.
- [ ] Tách type UI khỏi `data-store.ts` nếu cần; không import data runtime.
- [ ] Kiểm tra mobile 390px và desktop.

### Task 3.2: Reader production state

**Owner:** PIXEL + FORGE  
**Files:** `src/app/story/[slug]/chapter/[chapterSlug]/page.tsx`, `src/components/reader/ReaderCanvas.tsx`, `src/app/api/reading-progress/route.ts`, `src/app/api/bookmarks/route.ts`

- [ ] Reader chỉ mở chapter public/published hoặc owner/admin.
- [ ] Progress debounce/throttle ghi DB, guest không tạo lỗi UI.
- [ ] Bookmark create/list/delete theo user; không localStorage làm nguồn chính.
- [ ] Prev/next chỉ trỏ chapter public hợp lệ.
- [ ] Test refresh, logout/login khác user, chapter draft direct URL.

### Task 3.3: Library thật

**Owner:** FORGE + PIXEL  
**Files:** `src/app/api/library/route.ts`, `src/app/library/page.tsx`, `src/components/story/StoryActions.tsx`

- [ ] Shelf `READING`, `FOLLOWING`, `FAVORITE`, `READ_LATER`, `FINISHED` dùng DB.
- [ ] Add/remove idempotent bằng unique constraint.
- [ ] Không seed fallback, không localStorage list.
- [ ] Guest nhận 401/CTA login.
- [ ] Test hai user không nhìn thấy library của nhau.

---

## Wave 4: Studio, author, admin

### Task 4.1: Studio DB-backed

**Owner:** FORGE + PIXEL  
**Files:** `src/app/studio/page.tsx`, `src/app/studio/stories/page.tsx`, `src/app/studio/stories/new/page.tsx`, `src/app/studio/stories/[id]/chapters/new/page.tsx`, `src/components/studio/ChapterEditorMobile.tsx`

- [ ] Studio require `AUTHOR`/`ADMIN`.
- [ ] Story list filter đúng `session.id`; admin có policy riêng.
- [ ] Create story/chapter dùng API Prisma, không hardcode genre/story.
- [ ] Draft save/publish status ghi DB.
- [ ] Validate title, description, cover, content, slug.
- [ ] Test author A không sửa story/chapter author B.

### Task 4.2: Author page và notifications/comments

**Owner:** FORGE + PIXEL  
**Files:** `src/app/author/[username]/page.tsx`, `src/app/notifications/page.tsx`, `src/app/api/comments/` (create), `src/app/api/notifications/` (create)

- [ ] Author profile/stories lấy `User/AuthorProfile/Story`.
- [ ] Comment list/create/reply/like dùng DB hoặc tạm ẩn nút chưa có API.
- [ ] Notifications đọc từ DB, mark-read idempotent.
- [ ] Không hiển thị mock comment/notification.

### Task 4.3: Admin API DB-backed

**Owner:** FORGE  
**Files:** toàn bộ `src/app/api/admin/**`, `src/app/admin/page.tsx`, `src/lib/admin/*` (create nếu cần)

- [ ] Stories, chapters, users, genres, badges, audit log dùng Prisma.
- [ ] Shared admin guard và audit log cho mutation.
- [ ] Ban/suspend user increment session version.
- [ ] Feature/delete story/chapter transactionally.
- [ ] Admin UI đọc API, có pagination và error state.
- [ ] Test mọi admin mutation bằng session và API key.

---

## Wave 5: Security, quality, browser QA

### Task 5.1: Security baseline

**Owner:** VORTEX + FORGE  
**Files:** `src/middleware.ts` hoặc `next.config.*`, auth routes, admin routes, `docs/ops/security.md`

- [ ] Cookie production `HttpOnly`, `Secure`, `SameSite=Lax/Strict`, safe path.
- [ ] Redirect chỉ nhận relative path allowlist.
- [ ] Cookie mutation dùng POST và kiểm tra Origin/CSRF strategy.
- [ ] Security headers: CSP tối thiểu phù hợp ảnh/font, HSTS production, frame/content sniffing policy.
- [ ] Không log token, password, API key, nội dung nhạy cảm.
- [ ] Rate-limit auth/admin/content mutation.

### Task 5.2: Contract/API tests

**Owner:** SENTINEL  
**Files:** `tests/release-contract.test.mjs`, `tests/api/*.test.mjs`, `package.json`

- [ ] Test auth, profile, story, chapter, library, progress, bookmark, admin.
- [ ] Test error mapping 400/401/403/404/409/503.
- [ ] Test no secret/passwordHash in response.
- [ ] Test no mock imports under runtime source.
- [ ] Chạy `npm run test:qa`.

### Task 5.3: Browser smoke và accessibility

**Owner:** SENTINEL + PIXEL  
**Files:** `tests/e2e/*`, `scripts/smoke-check.mjs`

- [ ] Guest: home -> discover -> search -> story -> reader.
- [ ] Reader: settings, bookmark, progress, prev/next.
- [ ] Reader auth: library sync.
- [ ] Author: register/upgrade -> create story -> create/publish chapter.
- [ ] Admin: login -> list -> mutation -> audit.
- [ ] Keyboard focus, labels, 44px target, mobile overflow.
- [ ] Chạy smoke trên staging với dữ liệu thật đã seed.

### Task 5.4: Review gate

**Owner:** VORTEX  

- [ ] Review diff theo severity P0/P1/P2.
- [ ] Không cho release nếu P0/P1 còn mở.
- [ ] Kiểm tra migration, env, authorization, mock scan, response data leakage.
- [ ] Ghi release verdict và residual risk.

---

## Wave 6: Staging và production

### Task 6.1: Provision staging

**Owner:** NEXUS + FORGE

- [ ] Tạo PostgreSQL managed staging.
- [ ] Set `DATABASE_URL`, `JWT_SECRET`, `ADMIN_API_KEY`, `NEXT_PUBLIC_SITE_URL` trong Vercel Preview.
- [ ] Chạy `npx prisma migrate deploy`.
- [ ] Chạy seed staging với credentials riêng.
- [ ] Deploy Preview, chạy smoke/browser tests.
- [ ] Kiểm tra logs, latency, DB connection, error rate.

### Task 6.2: Release candidate

**Owner:** NEXUS + SENTINEL + VORTEX

- [ ] Tag/commit release candidate.
- [ ] Chạy:

```powershell
npm ci
npm run lint
npm run test:qa
npx prisma validate
npx prisma migrate status
npm run build
```

- [ ] Chạy `BASE_URL=<staging-url> npm run smoke:check`.
- [ ] Xác nhận không còn runtime mock import:

```powershell
rg -n "STORIES_DATA|CHAPTERS_DATA|DEMO_USERS|BADGES_DATA|GENRES_DATA|data-store" src/app src/components src/lib
```

- [ ] Chỉ giữ import seed adapter nếu grep được scope rõ và có comment.

### Task 6.3: Production deploy

**Owner:** NEXUS + FORGE

- [ ] Tạo production PostgreSQL hoặc database branch riêng.
- [ ] Backup/restore test trước migration.
- [ ] Set production secrets; rotate mọi credential từng xuất hiện trong repo/docs.
- [ ] Chạy `npx prisma migrate deploy`.
- [ ] Seed dữ liệu thật đã duyệt; không seed demo account nếu không được yêu cầu.
- [ ] Deploy Vercel production.
- [ ] Chạy smoke với tài khoản kiểm thử production.
- [ ] Kiểm tra `/api/health`, login, story, chapter, library, studio, admin.
- [ ] Bật domain/SSL, analytics/error monitoring, backup schedule.

### Task 6.4: Rollback và handoff

**Owner:** NEXUS + SENTINEL

- [ ] Ghi `docs/ops/rollback.md`: Vercel rollback, DB backup restore, secret rotation, disable writes.
- [ ] Xác nhận rollback deploy không rollback DB migration phá dữ liệu.
- [ ] Ghi release version, migration version, env checklist, owner on-call.
- [ ] Gắn release evidence vào PR/tag.

---

## Definition of Done

- [ ] PostgreSQL production reachable; migration status clean.
- [ ] Seed/data import hoàn tất; runtime không dùng in-memory mock.
- [ ] Register/login/logout/profile/session revocation pass.
- [ ] Public read, search, genre, author, chapter reader pass.
- [ ] Library, progress, bookmark sync đúng user.
- [ ] Author studio create/edit/publish pass.
- [ ] Admin auth, mutations, audit logs pass.
- [ ] `npm run lint`, `npm run test:qa`, `npx tsc --noEmit --incremental false`, `npm run build` pass.
- [ ] Staging smoke pass; production smoke pass.
- [ ] VORTEX verdict không còn P0/P1.
- [ ] Rollback runbook và backup verified.

## Không làm trước public

- Không thêm recommendation engine, chat, payment, search index riêng, realtime notification, mobile app.
- Không thêm dependency nếu Prisma/Next.js/Node stdlib xử lý được.
- Không xoá `data-store.ts` trước khi seed đã được kiểm chứng và toàn bộ import scan sạch.

