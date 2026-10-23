# Production release

Set these Vercel environment variables for Preview and Production:

- `DATABASE_URL`: managed PostgreSQL URL with SSL.
- `JWT_SECRET`: random secret, minimum 32 bytes.
- `ADMIN_API_KEY`: random secret for external admin API calls.
- `NEXT_PUBLIC_SITE_URL`: final HTTPS site URL.

Deploy sequence:

```bash
npm ci
npm run prisma:migrate:deploy
SEED_ADMIN_PASSWORD='...' SEED_AUTHOR_PASSWORD='...' SEED_READER_PASSWORD='...' npm run prisma:seed
npm run build
npm run smoke:check
```

Use staging database first. Run smoke with `BASE_URL`, `SMOKE_EMAIL`, and
`SMOKE_PASSWORD`. Rotate `JWT_SECRET` to revoke all sessions. Rotate
`ADMIN_API_KEY` in Vercel Secret Environment Variables, then redeploy.

Do not run `prisma db push` against production. Do not store seed passwords,
JWT secrets, or API keys in Git.
