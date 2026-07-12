import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations-smartstay",
  schema: "./db/schema.ts",
  dialect: "sqlite",
});
