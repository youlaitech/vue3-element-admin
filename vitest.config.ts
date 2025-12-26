import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  plugins: [vue()],
  test: {
    // 使用 happy-dom 作为测试环境（比 jsdom 快）
    environment: "happy-dom",

    // 全局测试 API（describe, it, expect 等）
    globals: true,

    // 测试环境设置文件
    setupFiles: ["./tests/setup.ts"],

    // 覆盖率配置
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "tests/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/mockData",
        "**/.{idea,git,cache,output,temp}",
      ],
    },

    // 测试文件匹配规则
    include: ["tests/**/*.{test,spec}.{js,ts}"],

    // 测试超时时间
    testTimeout: 10000,
  },

  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
