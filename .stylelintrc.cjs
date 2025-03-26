module.exports = {
  extends: [
    "stylelint-config-recommended",
    "stylelint-config-recommended-scss",
    "stylelint-config-recommended-vue/scss",
    "stylelint-config-html/vue",
    "stylelint-config-recess-order",
  ],

  plugins: [
    "stylelint-prettier", // 统一代码风格，格式冲突时以 Prettier 规则为准
  ],
  overrides: [
    {
      files: ["**/*.{vue,html}"],
      customSyntax: "postcss-html",
    },
    {
      files: ["**/*.{css,scss}"],
      customSyntax: "postcss-scss",
    },
  ],
  rules: {
    "prettier/prettier": true, // 强制执行 Prettier 格式化规则（需配合 .prettierrc 配置文件）
    "no-empty-source": null, //  允许空的样式文件
    "declaration-property-value-no-unknown": null, // 允许非常规数值格式 ,如 height: calc(100% - 50)
    // 允许使用未知伪类
    "selector-pseudo-class-no-unknown": [
      true,
      {
        ignorePseudoClasses: ["global", "export", "deep"],
      },
    ],
    // 允许使用未知伪元素
    "at-rule-no-unknown": null, // 禁用默认的未知 at-rule 检查
    "scss/at-rule-no-unknown": true, // 启用 SCSS 特定的 at-rule 检查
  },
};
