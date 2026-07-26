import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export default defineConfig({
  resolve: {
    alias: {
      "@zeo/core": path.join(root, "packages/core/src/index.ts"),
      "@zeo/models": path.join(root, "packages/models/src/index.ts"),
      "server-only": path.join(root, "apps/cli/test-stubs/server-only.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
