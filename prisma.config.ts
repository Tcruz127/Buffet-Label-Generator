import "dotenv/config";
import { defineConfig, env } from "prisma/config";

const dbUrl = env("DATABASE_URL");
console.log("PRISMA DATABASE_URL =", dbUrl);

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: dbUrl,
  },
});