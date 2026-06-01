import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import onlyWarn from "eslint-plugin-only-warn";
import turboPlugin from "eslint-plugin-turbo";
import tseslint from "typescript-eslint";

/**
 * Configuración base de ESLint para el monorepo Marweld Perú.
 *
 * @type {import("eslint").Linter.Config}
 */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended.map((conf) => ({
    ...conf,
    files: ["**/*.ts", "**/*.tsx"],
  })),
  {
    plugins: {
      turbo: turboPlugin,
      "only-warn": onlyWarn, // Asignar un nombre al plugin
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
    },
  },
  {
    ignores: ["**/dist/**", "**/node_modules/**", "**/.next/**"],
  },
];
