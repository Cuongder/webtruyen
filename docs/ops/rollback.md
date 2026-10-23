# Mộc Thư Production Rollback Runbook

This runbook defines emergency procedures for reverting deployments, restoring database state, and rotating compromised credentials.

---

## 1. Fast Vercel Deployment Rollback (P0 Incident)

If the active deployment introduces critical errors or regressions:

1. Open Vercel Dashboard -> Project `webtruyen` -> **Deployments**.
2. Identify previous stable deployment tag / commit.
3. Click `...` -> **Promote to Production** (or run `vercel rollback` via CLI).
4. Verify `/api/health` returns `200 OK` with `{ ok: true, database: "ok" }`.

> **Note:** Vercel rollback reverts application code only. Database state and migrations remain intact.

---

## 2. Database Backup & Restore Procedure

All database migrations in `prisma/migrations` are additive (backward-compatible) to prevent downtime during rollbacks.

### Restore Managed PostgreSQL Snapshot:
1. Locate automated daily or pre-deployment snapshot in managed database console (e.g. Neon, Supabase, RDS).
2. For point-in-time recovery (PITR):
   - Restore database to the exact timestamp prior to incident.
   - Point `DATABASE_URL` in Vercel to restored instance branch.
   - Redeploy or trigger instant redeploy.
3. Never run `prisma db push --force-reset` on production database.

---

## 3. Secret Rotation Workflow

### JWT Session Secret Compromise:
1. Generate new 64-character random string:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. Update `JWT_SECRET` in Vercel Environment Variables (Production & Preview).
3. Trigger redeployment.
4. **Impact:** All active user sessions are invalidated immediately, forcing re-authentication.

### Admin API Key Compromise:
1. Generate new 48-character random key:
   ```bash
   node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
   ```
2. Update `ADMIN_API_KEY` in Vercel Environment Variables.
3. Trigger redeployment.
4. Update trusted external systems/cron workers calling `/api/admin/*`.

---

## 4. Emergency Write-Freeze Mode

If database corruption or runaway mutation occurs:
1. Set database user to read-only mode in PostgreSQL:
   ```sql
   ALTER USER mocthu_app SET default_transaction_read_only = on;
   ```
2. UI reads and chapter reader remain functional; all mutations return 500/503 gracefully.
3. Once resolved, restore read-write:
   ```sql
   ALTER USER mocthu_app SET default_transaction_read_only = off;
   ```
