import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@zeo/contracts": path.resolve(currentDir, "../contracts/src"),
      "@zeo/id": path.resolve(currentDir, "../id/src"),
    },
  },
  test: {
    globals: true,
    environment: "node",
  },
});
