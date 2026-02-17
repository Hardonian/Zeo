import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node
      }
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "no-undef": "off",
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@prisma/client"],
              message: "Use data-layer abstractions from @zeo/db instead of direct Prisma access."
            }
          ]
        }
      ]
    }
  },
  {
    files: ["apps/web/src/app/api/webhooks/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@zeo/policy", "@zeo/analysis"],
              message: "Webhook routes must not execute policy/static analysis directly. Enqueue jobs via service layer."
            }
          ]
        }
      ]
    }
  },
  {
    files: ["apps/web/src/app/api/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@zeo/analysis"],
              message: "Controllers must delegate static analysis to services/jobs."
            }
          ]
        }
      ]
    }
  },
  {
    files: ["packages/core/src/kernel/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["node:fs", "node:path", "node:net", "node:http", "node:https", "node:child_process", "node:os"],
              message: "Kernel must be pure: no I/O, no network, no filesystem, no OS access. Use runtime adapter instead."
            },
            {
              group: ["@zeo/db", "@zeo/mcp-server", "@zeo/trust", "@zeo/warehouse", "@zeo/telemetry"],
              message: "Kernel must not import impure packages. Inject data via KernelInput."
            }
          ]
        }
      ]
    }
  },
  {
    files: ["**/*.js", "**/*.mjs"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node
      }
    }
  },
  {
    files: ["apps/web/**/*.ts", "apps/web/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@zeo/core",
              message: "Web cannot import @zeo/core directly. Use @zeo/core/client or @zeo/contracts."
            },
            {
              name: "@zeo/cli",
              message: "Web runtime must not import CLI modules. Move shared logic into runtime-neutral packages."
            },
            {
              name: "@zeo/mcp-server",
              message: "Web runtime must not import MCP server modules. Use shared contracts or adapters instead."
            }
          ],
          patterns: [
            {
              group: ["@zeo/cli/*", "@zeo/mcp-server/*"],
              message: "Web runtime must not import CLI or MCP server modules."
            }
          ]
        }
      ]
    }
  },
  {
    files: ["packages/contracts/src/**/*.ts"],
    ignores: ["packages/contracts/src/**/__tests__/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["node:*", "@zeo/cli", "@zeo/cli/*", "@zeo/mcp-server", "@zeo/mcp-server/*"],
              message: "Shared contracts must remain runtime-neutral and cannot depend on Node-only, CLI, or MCP modules."
            }
          ]
        }
      ]
    }
  },
  {
    ignores: ["**/dist/**", "**/node_modules/**", "**/.next/**", "**/.turbo/**", "**/out/**", "**/coverage/**"]
  }
);
