import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import importPlugin from "eslint-plugin-import";
import prettier from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";
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
        ecmaFeatures: {
          jsx: true,
        },
        project: "./tsconfig.json",
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
      // React rules - MODERERT FOR OVERGANG
      "react/jsx-props-no-spreading": "off",
      "react/react-in-jsx-scope": "off",
      "react/require-default-props": "off",
      "react/jsx-filename-extension": "off",
      "react/function-component-definition": "error",
      "react/prop-types": "off",
      "react/jsx-uses-vars": "error",

      // React Hooks
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "off",

      // FILE SIZE RULES - Restore from ESLint 8
      "max-lines": [
        "warn",
        {
          max: 400,
          skipBlankLines: true,
          skipComments: true,
        },
      ],

      // FILE SIZE RULES - Restore from ESLint 8
      "max-lines": [
        "warn",
        {
          max: 400,
          skipBlankLines: true,
          skipComments: true,
        },
      ],

      // Import rules - DEAKTIVERT MIDLERTIDIG
      "import/extensions": "off",
      "import/prefer-default-export": "off",
      "import/order": "off",
      "import/no-unresolved": "off",
      "import/no-extraneous-dependencies": "off",
      "import/first": "off",
      "import/newline-after-import": "off",

      // TypeScript rules
      "@typescript-eslint/no-unused-vars": "off",
      "no-unused-vars": "warn",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": "warn",

      // General rules
      "prefer-const": "error",
      "no-var": "error",
      "no-console": "warn",
      eqeqeq: "warn",
      "prefer-arrow-callback": "off",
      "arrow-spacing": "error",
      "no-unused-vars": "off", // Use TypeScript version instead
      "no-constant-binary-expression": "warn",

      // Prettier integration
      "prettier/prettier": "error",
    },
    settings: {
      react: {
        version: "detect",
      },
      "import/resolver": {
        typescript: {
          project: "./tsconfig.json",
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
  prettierConfig,
);
