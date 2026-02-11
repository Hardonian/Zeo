import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tsconfigBasePath = path.resolve(__dirname, "../../tsconfig.base.json");
const tsconfigBase = JSON.parse(fs.readFileSync(tsconfigBasePath, "utf-8")) as {
  compilerOptions?: { paths?: Record<string, string[]> };
};

const aliases = Object.entries(tsconfigBase.compilerOptions?.paths ?? {}).map(([key, value]) => {
  const replacement = Array.isArray(value) ? value[0] : value;
  const find = new RegExp(`^${key.replace("*", "(.*)")}$`);
  const resolved = replacement.replace("*", "$1");
  const withEntry = path.extname(resolved) === "" ? `${resolved}/index.ts` : resolved;
  const target = path.resolve(__dirname, "../../", withEntry);
  return { find, replacement: target };
});

export default defineConfig({
  resolve: {
    alias: aliases,
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
