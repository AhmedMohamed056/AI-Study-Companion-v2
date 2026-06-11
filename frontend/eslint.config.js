import reactPlugin from "eslint-plugin-react";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: ["node_modules/", "dist/", "vite.config.ts"],
  },
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx,js,jsx}"],
    plugins: {
      react: reactPlugin,
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "react/no-unescaped-entities": "warn",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];