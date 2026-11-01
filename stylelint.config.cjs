module.exports = {
  extends: [
    "stylelint-config-recommended-scss",
    "stylelint-config-recess-order",
    // 提供 Vue 解析与规则，必须放在最后
    "stylelint-config-recommended-vue/scss",
  ],
  rules: {
    "no-empty-source": null,
    "no-invalid-position-declaration": null,
    "selector-pseudo-class-no-unknown": [
      true,
      {
        ignorePseudoClasses: ["global", "export", "deep"],
      },
    ],
    "selector-pseudo-element-no-unknown": [
      true,
      {
        ignorePseudoElements: ["deep", "slotted", "global", "v-deep", "v-slotted", "v-global"],
      },
    ],
  },
};
