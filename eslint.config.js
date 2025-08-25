import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import importPlugin from "eslint-plugin-import";
import prettier from "eslint-plugin-prettier";
import { fileURLToPath } from "url";
import path from "path";
import globals from "globals";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
        // Pek til tsconfig som inkluderer tests/e2e/**
        project: "./tsconfig.eslint.json",
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
      import: importPlugin,
      prettier,
    },
    rules: {
      "max-lines": ["warn", { max: 400, skipBlankLines: true, skipComments: true }],
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",

      // General rules
      "prefer-const": "error",
      "no-var": "error",
      "no-console": "error",
      eqeqeq: "warn",
      "arrow-spacing": "error",
      "no-unused-vars": "off", // Use TypeScript version instead
      "no-constant-binary-expression": "warn",

      // Prettier integration
      "prettier/prettier": "error",
    },
    settings: {
      react: { version: "detect" },
      "import/resolver": {
        typescript: {
          project: ["./tsconfig.eslint.json", "./tests/tsconfig.json"],
        },
      },
    },
  },
  {
    files: ["**/*.test.{js,jsx,ts,tsx}", "**/*.spec.{js,jsx,ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        vi: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "off",
    },
  },
  // Type-aware linting for e2e med eget prosjekt
  {
    files: ["tests/e2e/**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        project: ["./tests/tsconfig.json"],
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    ignores: [
      "build/**",
      "dist/**",
      "node_modules/**",
      "**/*.config.js",
      "**/*.config.mjs",
      "generate-local-config.js",
      "example/**",
      "src/graphql/generated/**",
    ],
  },
);
