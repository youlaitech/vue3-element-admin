import vue from "@vitejs/plugin-vue";
import { type ConfigEnv, type UserConfig, loadEnv, defineConfig } from "vite";

import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

import { mockDevServerPlugin } from "vite-plugin-mock-dev-server";

import UnoCSS from "unocss/vite";
import { resolve } from "node:path";
import packageInfo from "./package.json" with { type: "json" };

// 平台名称、版本信息
const __APP_INFO__ = {
  pkg: { name: packageInfo.name, version: packageInfo.version },
  buildTimestamp: Date.now(),
};

const pathSrc = resolve(import.meta.dirname, "src");

export default defineConfig(({ mode, command, isPreview }: ConfigEnv): UserConfig => {
  const env = loadEnv(mode, import.meta.dirname, "");
  const isDevServer = command === "serve" && !isPreview;
  const port = Number(env.APP_PORT ?? "3000");
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error("APP_PORT 必须是 1–65535 的整数");
  const proxyTarget = env.API_PROXY_TARGET;
  if (isDevServer) {
    if (!proxyTarget || !/^https?:\/\//.test(proxyTarget))
      throw new Error("API_PROXY_TARGET 必须是 HTTP(S) 地址");
    new URL(proxyTarget);
  }

  return {
    // 部署在子路径时由 .env.youlai 指定 VITE_BASE_URL，缺省用站点根路径
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
    server: isDevServer
      ? {
          host: "0.0.0.0",
          port,
          open: true,
          proxy: {
            "/api/v1/realtime/ws": {
              target: proxyTarget,
              ws: true,
            },
            [env.VITE_API_BASE]: {
              changeOrigin: true,
              target: proxyTarget,
              rewrite: (path: string) => path.slice(env.VITE_API_BASE.length),
            },
            // 保留浏览器访问地址，OIDC 回调经开发代理返回。
            "/oauth2": {
              changeOrigin: true,
              xfwd: true,
              target: proxyTarget,
            },
            "/login/oauth2": {
              changeOrigin: true,
              xfwd: true,
              target: proxyTarget,
            },
          },
        }
      : undefined,
    plugins: [
      vue(),
      ...(env.VITE_MOCK_ENABLED === "true" ? [mockDevServerPlugin()] : []),
      UnoCSS(),
      // API 自动导入
      AutoImport({
        // 导入 Vue 函数，如：ref, reactive, toRef 等
        imports: ["vue", "@vueuse/core", "pinia", "vue-router", "vue-i18n"],
        resolvers: [
          // 导入 Element Plus函数，如：ElMessage, ElMessageBox 等
          ElementPlusResolver({ importStyle: "sass" }),
        ],
        vueTemplate: true,
        // 类型声明默认不生成，新增自动导入的函数后手动打开并提交一次声明文件
        dts: false,
        // dts: "types/auto-imports.d.ts",
      }),
      // 组件自动导入
      Components({
        resolvers: [
          // 导入 Element Plus 组件
          ElementPlusResolver({ importStyle: "sass" }),
        ],
        // 指定自定义组件位置(默认:src/components)
        dirs: ["src/components", "src/**/components"],
        // 类型声明默认不生成，新增自动导入的组件后手动打开并提交一次声明文件
        dts: false,
        // dts: "types/components.d.ts",
      }),
      // 生成版本号文件
      {
        name: "dist-version",
        apply: "build",
        generateBundle() {
          this.emitFile({
            type: "asset",
            fileName: "version.json",
            source: JSON.stringify({ version: __APP_INFO__.buildTimestamp }),
          });
        },
      },
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
        "@element-plus/icons-vue",
        "element-plus/es",
        "element-plus/es/locale/lang/en",
        "element-plus/es/locale/lang/zh-cn",
        // Element Plus 组件样式预构建：按 src 实际用到的组件清单硬编码，首启即预加载，
        // 避免首次使用某组件时触发依赖重优化导致页面刷新
        ...[
          "alert",
          "avatar",
          "backtop",
          "badge",
          "base",
          "breadcrumb",
          "breadcrumb-item",
          "button",
          "card",
          "cascader",
          "checkbox",
          "checkbox-group",
          "checkbox-button",
          "col",
          "color-picker",
          "config-provider",
          "collapse-transition",
          "date-picker",
          "descriptions",
          "descriptions-item",
          "dialog",
          "divider",
          "drawer",
          "dropdown",
          "dropdown-item",
          "dropdown-menu",
          "empty",
          "form",
          "form-item",
          "icon",
          "image",
          "image-viewer",
          "input",
          "input-number",
          "input-tag",
          "link",
          "loading",
          "menu",
          "menu-item",
          "message",
          "message-box",
          "notification",
          "option",
          "pagination",
          "popover",
          "progress",
          "radio",
          "radio-button",
          "radio-group",
          "result",
          "row",
          "scrollbar",
          "select",
          "skeleton",
          "skeleton-item",
          "space",
          "step",
          "steps",
          "sub-menu",
          "switch",
          "tab-pane",
          "table",
          "table-column",
          "tabs",
          "tag",
          "text",
          "time-picker",
          "time-select",
          "timeline",
          "timeline-item",
          "tooltip",
          "tree",
          "tree-select",
          "upload",
          "watermark",
        ].map((c) => `element-plus/es/components/${c}/style/index`),
        // 流程设计器与预览器为路由懒加载，bpmn-js 体积大，首启预构建避免进入页面时重优化刷新
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
