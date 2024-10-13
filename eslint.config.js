import globals from "globals";
import js from "@eslint/js";

// ESLint 核心插件
import pluginVue from "eslint-plugin-vue";
import pluginTypeScript from "@typescript-eslint/eslint-plugin";

// Prettier 插件及配置
import configPrettier from "eslint-config-prettier";
import pluginPrettier from "eslint-plugin-prettier";

// 解析器
import * as parserVue from "vue-eslint-parser";
import * as parserTypeScript from "@typescript-eslint/parser";

// 定义 ESLint 配置
export default [
  // 通用 JavaScript 配置
  {
    ...js.configs.recommended,
    ignores: ["**/.*", "dist/*", "*.d.ts", "public/*", "src/assets/**"],
    languageOptions: {
      globals: {
        ...globals.browser, // 浏览器变量 (window, document 等)
        ...globals.node, // Node.js 变量 (process, require 等)
      },
    },
    plugins: {
      prettier: pluginPrettier,
    },
    rules: {
      ...configPrettier.rules,
      ...pluginPrettier.configs.recommended.rules,
      "no-debug": "off", // 禁止 debugger
      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ], // 允许未使用的变量，以 _ 开头的变量不检查
      "prettier/prettier": [
        "error",
        {
          endOfLine: "auto", // 自动识别换行符
        },
      ],
    },
  },

  // TypeScript 配置
  {
    files: ["**/*.?([cm])ts"],
    languageOptions: {
      parser: parserTypeScript,
      parserOptions: {
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": pluginTypeScript,
    },
    rules: {
      ...pluginTypeScript.configs.strict.rules,
      "@typescript-eslint/ban-types": "off", // 禁止特定类型
      "@typescript-eslint/no-redeclare": "error", // 禁止重复声明
      "@typescript-eslint/ban-ts-comment": "off", // 禁止特定注释
      "@typescript-eslint/no-explicit-any": "off", // 禁止使用 any
      "@typescript-eslint/prefer-as-const": "warn", // 使用 as const 替代 as 'const'
      "@typescript-eslint/no-empty-function": "off", // 禁止空函数
      "@typescript-eslint/no-non-null-assertion": "off", // 禁止非空断言
      "@typescript-eslint/no-import-type-side-effects": "error", // 禁止导入类型产生副作用
      "@typescript-eslint/explicit-module-boundary-types": "off", // 显式函数返回类型
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { disallowTypeAnnotations: false, fixStyle: "inline-type-imports" },
      ], // 一致的类型导入
      "@typescript-eslint/prefer-literal-enum-member": [
        "error",
        { allowBitwiseExpressions: true },
      ], // 使用字面量枚举成员
    },
  },

  // TypeScript 声明文件的特殊配置
  {
    files: ["**/*.d.ts"],
    rules: {
      "eslint-comments/no-unlimited-disable": "off",
      "unused-imports/no-unused-vars": "off",
    },
  },

  // JavaScript 配置（包含 commonjs）
  {
    files: ["**/*.?([cm])js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off", // 禁止 require
      "@typescript-eslint/no-var-requires": "off", // 禁止 require
    },
  },

  // Vue 文件配置
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: parserVue,
      parserOptions: {
        extraFileExtensions: [".vue"],
        parser: "@typescript-eslint/parser",
        sourceType: "module",
      },
    },
    plugins: {
      vue: pluginVue,
    },
    processor: pluginVue.processors[".vue"],
    rules: {
      ...pluginVue.configs.base.rules, // Vue 基础配置
      ...pluginVue.configs["vue3-essential"].rules, // Vue3 基础配置
      ...pluginVue.configs["vue3-recommended"].rules, // Vue3 推荐配置
      "no-undef": "off",
      "no-unused-vars": "off",
      "vue/no-v-html": "off",
      "vue/require-default-prop": "off",
      "vue/require-explicit-emits": "off",
      "vue/multi-word-component-names": "off",
      "vue/no-setup-props-reactivity-loss": "off",
      "vue/html-self-closing": [
        "error",
        {
          html: {
            void: "always",
            normal: "always",
            component: "always",
          },
          svg: "always",
          math: "always",
        },
      ], // 自闭合标签
    },
  },
];
