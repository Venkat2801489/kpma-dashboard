import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // `prisma generate` runs in `postinstall`, before a database connection
    // is guaranteed to be configured (e.g. Vercel's install step) — it never
    // actually needs one, so this must not throw when DATABASE_URL is unset.
    // The real runtime connection is built explicitly in lib/db.ts.
    url: process.env.DATABASE_URL ?? "",
  },
});
