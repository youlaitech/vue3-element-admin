// https://eslint.org/docs/latest/use/configure/configuration-files-new

import eslint from "@eslint/js";
import pluginVue from "eslint-plugin-vue";
import pluginTypeScript from "@typescript-eslint/eslint-plugin";
import parserTypeScript from "@typescript-eslint/parser";
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
  // 全局配置
  {
    // 指定要检查的文件
    files: ["**/*.js", "**/*.ts", "**/*.vue"],
    ignores: ["node_modules/**", "dist/**", "build/**"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser, // 浏览器环境全局变量
        ...globals.node, // Node.js 环境全局变量
        ...autoImportGlobals, // 自动导入的 API 函数
        ...elementPlusComponents, // Element Plus 组件
        // 全局类型定义，解决 TypeScript 中定义但 ESLint 不识别的问题
        PageQuery: "readonly",
        PageResult: "readonly",
        OptionType: "readonly",
        ResponseData: "readonly",
        ExcelResult: "readonly",
        TagView: "readonly",
        AppSettings: "readonly",
        __APP_INFO__: "readonly",
      },
      parser: parserTypeScript,
      parserOptions: {
        sourceType: "module",
      },
    },
    rules: {
      // 全局规则
      "no-unused-vars": [
        "error",
        {
          vars: "all",
          args: "after-used",
          ignoreRestSiblings: true,
          argsIgnorePattern: "^_", // 忽略以下划线开头的参数
          varsIgnorePattern: "^[A-Z][A-Z0-9_]*$", // 忽略全大写的常量/枚举
        },
      ],
      // 禁用未定义变量检查，TypeScript 已处理类型检查
      "no-undef": "off",
    },
  },

  // 基础 JavaScript 配置
  eslint.configs.recommended,

  // Vue 配置
  {
    files: ["**/*.vue"],
    plugins: {
      vue: pluginVue,
    },
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        parser: parserTypeScript,
      },
    },
    processor: pluginVue.processors[".vue"],
    rules: {
      "vue/multi-word-component-names": "off",
      "vue/no-v-html": "off",
      "vue/require-default-prop": "off",
      "vue/html-self-closing": [
        "error",
        {
          html: {
            void: "always",
            normal: "never",
            component: "always",
          },
        },
      ],
      "vue/no-unused-vars": "off",
    },
  },

  // TypeScript 配置
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.vue"],
    plugins: {
      "@typescript-eslint": pluginTypeScript,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          vars: "all",
          args: "after-used",
          ignoreRestSiblings: true,
          argsIgnorePattern: "^_", // 忽略以下划线开头的参数
          varsIgnorePattern: "^[A-Z][A-Z0-9_]*$", // 忽略全大写的常量/枚举
        },
      ],
    },
  },

  // CURD 组件配置
  {
    files: ["**/components/CURD/**/*.{ts,vue}"],
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },

  // Prettier 集成
  {
    rules: {
      ...configPrettier.rules,
    },
  },
];
