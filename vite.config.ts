import vue from "@vitejs/plugin-vue";
import { type ConfigEnv, type UserConfig, loadEnv, defineConfig } from "vite";

import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

import { mockDevServerPlugin } from "vite-plugin-mock-dev-server";

import UnoCSS from "unocss/vite";
import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import packageInfo from "./package.json" with { type: "json" };

// 平台名称、版本信息
const __APP_INFO__ = {
  pkg: { name: packageInfo.name, version: packageInfo.version },
  buildTimestamp: Date.now(),
};

const pathSrc = resolve(import.meta.dirname, "src");

export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  const env = loadEnv(mode, import.meta.dirname, "");
  const port = Number(env.APP_PORT) || undefined;
  const proxyTarget = env.API_PROXY_TARGET;

  return {
    // 部署在子路径时由环境变量 VITE_BASE_URL 指定，缺省用站点根路径
    base: env.VITE_BASE_URL || "/",
    resolve: {
      alias: {
        "@": pathSrc,
      },
    },
    css: {
      preprocessorOptions: {
        // 注入项目布局变量。
        scss: {
          additionalData: `@use "@/styles/variables.scss" as *;`,
        },
      },
    },
    server: {
      host: "0.0.0.0",
      port,
      open: true,
      proxy: {
        [env.VITE_API_BASE]: {
          changeOrigin: true,
          target: proxyTarget,
          rewrite: (path: string) => path.slice(env.VITE_API_BASE.length),
        },
        // 通知中心 WebSocket，单独代理以完成 ws 升级
        "/api/v1/realtime/ws": {
          changeOrigin: true,
          rewriteWsOrigin: true,
          target: proxyTarget,
          ws: true,
        },
        // 统一认证登录的授权跳转与回调，路径不改写，跳转回当前开发地址
        "^/(oauth2|login/oauth2)": {
          changeOrigin: true,
          xfwd: true,
          target: proxyTarget,
        },
      },
    },
    plugins: [
      vue(),
      ...(env.VITE_MOCK_ENABLED === "true" ? [mockDevServerPlugin()] : []),
      UnoCSS(),
      // 函数自动导入
      AutoImport({
        imports: ["vue", "@vueuse/core", "pinia", "vue-router", "vue-i18n"],
        // Element Plus 函数按需导入
        resolvers: [ElementPlusResolver({ importStyle: "sass" })],
        vueTemplate: true,
        // 默认不生成类型声明，需要时改用下面的 dts 路径
        dts: false,
        // dts: "types/auto-imports.d.ts",
      }),
      // 组件自动导入
      Components({
        resolvers: [
          // Element Plus 组件按需导入
          ElementPlusResolver({ importStyle: "sass" }),
        ],
        // 全局组件与页面内组件目录
        dirs: ["src/components", "src/**/components"],
        // 默认不生成类型声明，需要时改用下面的 dts 路径
        dts: false,
        // dts: "types/components.d.ts",
      }),
      distVersionPlugin,
    ],
    // 预加载项目必需的依赖
    optimizeDeps: {
      include: [
        "vue",
        "vue-router",
        "element-plus",
        "pinia",
        "axios",
        "@vueuse/core",
        "codemirror-editor-vue3",
        "exceljs",
        "path-to-regexp",
        "echarts/core",
        "echarts/renderers",
        "echarts/charts",
        "echarts/components",
        "vue-i18n",
        "nprogress",
        "sortablejs",
        "qs",
        "vxe-table",
        "path-browserify",
        "lodash-es",
        "dompurify",
        "@element-plus/icons-vue",
        "element-plus/es",
        "element-plus/es/locale/lang/en",
        "element-plus/es/locale/lang/zh-cn",
        // Element Plus 组件样式：按组件目录枚举，新增组件时不会在运行期补优化并刷新页面
        ...getElementPlusStyleDeps(),
        // 流程设计器与预览器为路由懒加载，首启预构建，避免进入页面时重优化刷新
        "bpmn-js/lib/Modeler",
        "bpmn-js/lib/NavigatedViewer",
        "bpmn-js/lib/util/ModelUtil",
      ],
    },
    // 构建配置（Vite 8 使用 Rolldown + Oxc）
    build: {
      // 单个 chunk 告警阈值（kB），取略高于最大 vendor 包的值
      chunkSizeWarningLimit: 1200,
      // 跳过 gzip 体积统计，加快构建
      reportCompressedSize: false,
      // CSS 压缩默认 Lightning CSS、JS 压缩默认 Oxc，无需显式配置
      rolldownOptions: {
        output: {
          // 产物按 assets/、css/、img/、fonts/、media/ 分类输出；资源目录避开 nginx 已占用的 /js/ 子路径
          entryFileNames: "assets/[name].[hash].js",
          chunkFileNames: "assets/[name].[hash].js",
          assetFileNames: (assetInfo) => {
            const assetName = assetInfo.names[0];
            if (!assetName) return "assets/[name].[hash][extname]";

            const ext = assetName.split(".").pop()?.split("?")[0] ?? "";
            if (/^(mp4|webm|ogg|mp3|wav|flac|aac)$/i.test(ext)) return `media/[name].[hash].[ext]`;
            if (/^(png|jpe?g|gif|svg|webp|avif)$/i.test(ext)) return `img/[name].[hash].[ext]`;
            if (/^(woff2?|eot|ttf|otf)$/i.test(ext)) return `fonts/[name].[hash].[ext]`;
            return `${ext}/[name].[hash].[ext]`;
          },
          codeSplitting: {
            groups: [
              // 框架核心，每个页面都依赖
              {
                name: "vendor-vue",
                test: /node_modules[\\/](vue|@vue|vue-router|pinia|vue-i18n|@vueuse)[\\/]/,
              },
              // 图表：大屏与报表页共用
              {
                name: "vendor-echarts",
                test: /node_modules[\\/](echarts|zrender)[\\/]/,
              },
              // vxe 表格体系
              {
                name: "vendor-table",
                test: /node_modules[\\/](vxe-table|vxe-pc-ui|xe-utils|@vxe-ui)[\\/]/,
              },
              // 流程设计器：仅工作流页面加载
              {
                name: "vendor-bpmn",
                test: /node_modules[\\/](bpmn-js|diagram-js|bpmn-moddle|moddle|moddle-xml)[\\/]/,
              },
            ],
          },
        },
      },
    },
    define: {
      __APP_INFO__: JSON.stringify(__APP_INFO__),
    },
  };
});

// 按组件目录枚举 Element Plus 样式入口，避免手写清单漏项后运行期补优化并刷新页面
function getElementPlusStyleDeps(): string[] {
  const componentsDir = resolve(import.meta.dirname, "node_modules/element-plus/es/components");
  if (!existsSync(componentsDir)) return [];
  return readdirSync(componentsDir, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() && existsSync(resolve(componentsDir, entry.name, "style/index.mjs"))
    )
    .map((entry) => `element-plus/es/components/${entry.name}/style/index`);
}

// 生成 version.json，供前端检测版本更新
const distVersionPlugin: Plugin = {
  name: "dist-version",
  apply: "build",
  generateBundle() {
    this.emitFile({
      type: "asset",
      fileName: "version.json",
      source: JSON.stringify({ version: __APP_INFO__.buildTimestamp }),
    });
  },
};
