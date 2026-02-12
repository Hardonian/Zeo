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
    ignores: ["**/dist/**", "**/node_modules/**"]
  }
);
