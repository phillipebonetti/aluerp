import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Generation and build must work in offline preview mode without a database.
    // Runtime database operations remain guarded by DATABASE_URL checks.
    url: process.env.DATABASE_URL ?? "postgresql://offline:offline@localhost:5432/offline",
  },
});
