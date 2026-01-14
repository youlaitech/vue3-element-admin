import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

export default defineConfig({
  plugins: [
    vue(),
    // API 自动导入
    AutoImport({
      imports: ["vue", "@vueuse/core", "pinia", "vue-router", "vue-i18n"],
      resolvers: [ElementPlusResolver()],
      dts: false,
    }),
    // 组件自动导入
    Components({
      resolvers: [ElementPlusResolver()],
      dts: false,
    }),
  ],
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
