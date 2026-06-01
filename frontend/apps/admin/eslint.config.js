import { viteConfig } from "@marweld/config/eslint/vite";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...viteConfig,
  {
    files: ["src/routes/**/*.{ts,tsx}"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
];
