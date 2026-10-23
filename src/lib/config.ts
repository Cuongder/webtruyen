const requiredProductionEnv = ["DATABASE_URL", "JWT_SECRET", "ADMIN_API_KEY"] as const;

export function assertProductionConfig() {
  if (process.env.NODE_ENV !== "production") return;
  const missing = requiredProductionEnv.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`CRITICAL_CONFIG_ERROR: missing ${missing.join(", ")}.`);
  }
}

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}
