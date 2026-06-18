import eslint from "@eslint/js";
import globals from "globals";
import * as typescriptEslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";
import configPrettier from "eslint-config-prettier";
import fs from "node:fs";

let autoImportGlobals: Record<string, "readonly"> = {};
try {
  autoImportGlobals =
    JSON.parse(fs.readFileSync("./.eslintrc-auto-import.json", "utf-8")).globals || {};
} catch (error) {
  console.warn("Could not load auto-import globals", error);
}

export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/*.min.*",
      "**/auto-imports.d.ts",
      "**/components.d.ts",
      "types/**/*.d.ts",
    ],
  },

  eslint.configs.recommended,
  ...pluginVue.configs["flat/recommended"],
  ...typescriptEslint.configs.recommended,

  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,vue}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2022,
        ...autoImportGlobals,
        __APP_INFO__: "readonly",
      },
    },
    plugins: {
      vue: pluginVue,
      "@typescript-eslint": typescriptEslint.plugin,
    },
    rules: {
      // 基础规则
      "no-console": ["error", { allow: ["warn", "error", "debug"] }],
      "no-debugger": "error",

      // ES6+ 规则
      "prefer-const": "error",
      "no-var": "error",
      "object-shorthand": "error",

      // 最佳实践
      eqeqeq: ["error", "always", { null: "ignore" }],
      "no-multi-spaces": "error",
      "no-multiple-empty-lines": ["error", { max: 1, maxBOF: 0, maxEOF: 0 }],

      // 禁用与 TypeScript 冲突的规则
      "no-unused-vars": "off",
      "no-undef": "off",
      "no-redeclare": "off",
      "@typescript-eslint/ban-ts-comment": "off",
    },
  },

  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        parser: typescriptEslint.parser,
        extraFileExtensions: [".vue"],
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      "vue/multi-word-component-names": "off",
      "vue/no-v-html": "off",
      "vue/require-default-prop": "off",
      "vue/require-explicit-emits": "error",
      "vue/no-unused-vars": "error",
      "vue/no-mutating-props": "off",
      "vue/valid-v-for": "warn",
      "vue/no-template-shadow": "warn",
      "vue/return-in-computed-property": "warn",
      "vue/block-order": [
        "error",
        {
          order: ["template", "script", "style"],
        },
      ],
      "vue/html-self-closing": [
        "error",
        {
          html: {
            void: "always",
            normal: "never",
            component: "always",
          },
          svg: "always",
          math: "always",
        },
      ],
      "vue/component-name-in-template-casing": ["error", "PascalCase"],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },

  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    languageOptions: {
      parser: typescriptEslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: "./tsconfig.eslint.json",
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-unused-expressions": "warn",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          fixStyle: "separate-type-imports",
          prefer: "type-imports",
        },
      ],
      "@typescript-eslint/no-import-type-side-effects": "error",
    },
  },

  {
    files: ["**/*.d.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },

  {
    files: ["**/components/CURD/**/*.{ts,vue}"],
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  {
    rules: {
      ...configPrettier.rules,
      "arrow-body-style": "off",
      "prefer-arrow-callback": "off",
    },
  },
];
