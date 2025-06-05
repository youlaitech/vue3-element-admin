// https://eslint.org/docs/latest/use/configure/configuration-files-new

import eslint from "@eslint/js";
import pluginVue from "eslint-plugin-vue";
import * as typescriptEslint from "typescript-eslint";
import vueParser from "vue-eslint-parser";
import globals from "globals";
import configPrettier from "eslint-config-prettier";

// 解析自动导入配置
import fs from "node:fs";
let autoImportGlobals = {};
try {
  autoImportGlobals =
    JSON.parse(fs.readFileSync("./.eslintrc-auto-import.json", "utf-8")).globals || {};
} catch (error) {
  // 文件不存在或解析错误时使用空对象
  console.warn("Could not load auto-import globals", error);
}

// Element Plus组件
const elementPlusComponents = {
  // Element Plus 组件添加为全局变量，避免 no-undef 报错
  ElInput: "readonly",
  ElSelect: "readonly",
  ElSwitch: "readonly",
  ElCascader: "readonly",
  ElInputNumber: "readonly",
  ElTimePicker: "readonly",
  ElTimeSelect: "readonly",
  ElDatePicker: "readonly",
  ElTreeSelect: "readonly",
  ElText: "readonly",
  ElRadioGroup: "readonly",
  ElCheckboxGroup: "readonly",
  ElOption: "readonly",
  ElRadio: "readonly",
  ElCheckbox: "readonly",
  ElInputTag: "readonly",
  ElForm: "readonly",
  ElFormItem: "readonly",
  ElTable: "readonly",
  ElTableColumn: "readonly",
  ElButton: "readonly",
  ElDialog: "readonly",
  ElPagination: "readonly",
  ElMessage: "readonly",
  ElMessageBox: "readonly",
  ElNotification: "readonly",
  ElTree: "readonly",
};

export default [
  // 忽略文件配置
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/*.min.*",
      "**/auto-imports.d.ts",
      "**/components.d.ts",
    ],
  },

  // 基础 JavaScript 配置
  eslint.configs.recommended,

  // Vue 推荐配置
  ...pluginVue.configs["flat/recommended"],

  // TypeScript 推荐配置
  ...typescriptEslint.configs.recommended,

  // 全局配置
  {
    // 指定要检查的文件
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,vue}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser, // 浏览器环境全局变量
        ...globals.node, // Node.js 环境全局变量
        ...globals.es2022, // ES2022 全局对象
        ...autoImportGlobals, // 自动导入的 API 函数
        ...elementPlusComponents, // Element Plus 组件
        // 全局类型定义，解决 TypeScript 中定义但 ESLint 不识别的问题
        PageQuery: "readonly",
        PageResult: "readonly",
        OptionType: "readonly",
        ApiResponse: "readonly",
        ExcelResult: "readonly",
        TagView: "readonly",
        AppSettings: "readonly",
        __APP_INFO__: "readonly",
      },
    },
    plugins: {
      vue: pluginVue,
      "@typescript-eslint": typescriptEslint.plugin,
    },
    rules: {
      // 基础规则
      "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
      "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",

      // ES6+ 规则
      "prefer-const": "error",
      "no-var": "error",
      "object-shorthand": "error",

      // 最佳实践
      eqeqeq: "off",
      "no-multi-spaces": "error",
      "no-multiple-empty-lines": ["error", { max: 1, maxBOF: 0, maxEOF: 0 }],

      // 禁用与 TypeScript 冲突的规则
      "no-unused-vars": "off",
      "no-undef": "off",
      "no-redeclare": "off",
      "@typescript-eslint/ban-ts-comment": "off",
    },
  },

  // Vue 文件特定配置
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        parser: typescriptEslint.parser,
        extraFileExtensions: [".vue"],
      },
    },
    rules: {
      // Vue 规则
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
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  // TypeScript 文件特定配置
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    languageOptions: {
      parser: typescriptEslint.parser,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // TypeScript 规则
      "@typescript-eslint/no-explicit-any": "off", // 允许使用any类型，方便开发
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unused-vars": "warn", // 降级为警告
      "@typescript-eslint/no-unused-expressions": "warn", // 降级为警告
      "@typescript-eslint/consistent-type-imports": "off", // 关闭强制使用type import
      "@typescript-eslint/no-import-type-side-effects": "error",
    },
  },

  // .d.ts 文件配置
  {
    files: ["**/*.d.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },

  // CURD 组件配置
  {
    files: ["**/components/CURD/**/*.{ts,vue}"],
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  // Prettier 集成（必须放在最后）
  configPrettier,
];
