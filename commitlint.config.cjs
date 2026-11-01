module.exports = {
  // 继承的规则
  extends: ["@commitlint/config-conventional"],
  // 自定义规则
  rules: {
    // @see https://commitlint.js.org/reference/rules.html

    // 提交类型枚举，git提交type必须是以下类型
    "type-enum": [
      2,
      "always",
      [
        "feat", // 新增功能
        "fix", // 修复缺陷
        "refactor", // 代码重构（不包括 bug 修复、功能新增）
        "style", // 代码格式（不影响功能，例如空格、分号等格式修正）
        "docs", // 文档变更
        "chore", // 对构建过程或辅助工具和库的更改（不影响源文件、测试用例）
        "perf", // 性能优化
        "test", // 添加疏漏测试或已有测试改动
        "ci", // 修改 CI 配置、脚本
      ],
    ],
    // subject 最多 50 个字符
    "subject-max-length": [2, "always", 50],
    "subject-case": [0], // subject大小写不做校验
  },

  prompt: {
    messages: {
      type: "选择你要提交的类型 :",
      scope: "选择一个提交范围（可选）:",
      customScope: "请输入自定义的提交范围 :",
      subject: "填写简短精炼的变更描述 :\n",
      body: '填写更加详细的变更描述（可选）。使用 "|" 换行 :\n',
      breaking: '列举非兼容性重大的变更（可选）。使用 "|" 换行 :\n',
      footerPrefixesSelect: "选择关联issue前缀（可选）:",
      customFooterPrefix: "输入自定义issue前缀 :",
      footer: "列举关联issue (可选) 例如: #31, #I3244 :\n",
      generatingByAI: "正在通过 AI 生成你的提交简短描述...",
      generatedSelectByAI: "选择一个 AI 生成的简短描述:",
      confirmCommit: "是否提交或修改commit ?",
    },
    // prettier-ignore
    types: [
      { value: "feat",     name: "特性:     ✨  新增功能", emoji: ":sparkles:" },
      { value: "fix",      name: "修复:     🐛  修复缺陷", emoji: ":bug:" },
      { value: "refactor", name: "重构:     🔄  代码重构（不修复错误也不添加特性的代码更改）", emoji: ":recycle:" },
      { value: "style",    name: "格式:     🌈  代码格式（空格、格式化、缺失的分号等）", emoji: ":lipstick:" },
      { value: "docs",     name: "文档:     📝  文档变更(更新README文件，或者注释)", emoji: ":memo:" },
      { value: "chore",    name: "其他:     🛠️   对构建过程或辅助工具和库的更改（不影响源文件、测试用例）", emoji: ":hammer:" },
      { value: "perf",     name: "性能:     🚀  性能优化", emoji: ":zap:" },
      { value: "test",     name: "测试:     🧪  添加疏漏测试或已有测试改动", emoji: ":white_check_mark:" },
      { value: "ci",       name: "集成:     ⚙️   修改 CI 配置、脚本", emoji: ":ferris_wheel:" },
    ],
    useEmoji: true,
    emojiAlign: "center",
    useAI: false,
    aiNumber: 1,
    themeColorCode: "",
    scopes: [],
    allowCustomScopes: true,
    allowEmptyScopes: true,
    customScopesAlign: "bottom",
    customScopesAlias: "custom",
    emptyScopesAlias: "empty",
    upperCaseSubject: false,
    markBreakingChangeMode: false,
    allowBreakingChanges: ["feat", "fix"],
    breaklineNumber: 100,
    breaklineChar: "|",
    skipQuestions: [],
    issuePrefixes: [{ value: "closed", name: "closed:   ISSUES has been processed" }],
    customIssuePrefixAlign: "top",
    emptyIssuePrefixAlias: "skip",
    customIssuePrefixAlias: "custom",
    allowCustomIssuePrefix: true,
    allowEmptyIssuePrefix: true,
    confirmColorize: true,
    maxHeaderLength: 100,
    maxSubjectLength: 50,
    minSubjectLength: 0,
    scopeOverrides: undefined,
    defaultBody: "",
    defaultIssues: "",
    defaultScope: "",
    defaultSubject: "",
  },
};
