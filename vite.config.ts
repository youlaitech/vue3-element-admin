import vue from "@vitejs/plugin-vue";
import { type ConfigEnv, type UserConfig, loadEnv, defineConfig, PluginOption } from "vite";

import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

import { mockDevServerPlugin } from "vite-plugin-mock-dev-server";

import UnoCSS from "unocss/vite";
import { resolve } from "path";
import { name, version } from "./package.json";

// 平台名称、版本信息
const __APP_INFO__ = {
  pkg: { name, version },
  buildTimestamp: Date.now(),
};

// ESM 模式下使用 import.meta.dirname（Node 20.11+）
const pathSrc = resolve(import.meta.dirname, "src");

// Vite配置  https://cn.vitejs.dev/config
export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  const env = loadEnv(mode, process.cwd());

  return {
    resolve: {
      alias: {
        "@": pathSrc,
      },
    },
    css: {
      preprocessorOptions: {
        // 定义全局 SCSS 变量
        scss: {
          additionalData: `@use "@/styles/base/variables.scss" as *;`,
        },
      },
    },
    server: {
      host: "0.0.0.0",
      port: +env.VITE_APP_PORT,
      open: true,
      proxy: {
        [env.VITE_APP_BASE_API]: {
          changeOrigin: true,
          target: env.VITE_APP_API_URL,
          rewrite: (path: string) => path.replace(new RegExp(`^${env.VITE_APP_BASE_API}`), ""),
        },
      },
    },
    plugins: [
      vue(),
      ...(env.VITE_MOCK_DEV_SERVER === "true" ? [mockDevServerPlugin()] : []),
      UnoCSS(),
      // API 自动导入
      AutoImport({
        // 导入 Vue 函数，如：ref, reactive, toRef 等
        imports: ["vue", "@vueuse/core", "pinia", "vue-router", "vue-i18n"],
        resolvers: [
          // 导入 Element Plus函数，如：ElMessage, ElMessageBox 等
          ElementPlusResolver({ importStyle: "sass" }),
        ],
        eslintrc: {
          enabled: false,
          filepath: "./.eslintrc-auto-import.json",
          globalsPropValue: true,
        },
        vueTemplate: true,
        // 导入函数类型声明文件路径 (false:关闭自动生成)
        dts: false,
        // dts: "src/types/auto-imports.d.ts",
      }),
      // 组件自动导入
      Components({
        resolvers: [
          // 导入 Element Plus 组件
          ElementPlusResolver({ importStyle: "sass" }),
        ],
        // 指定自定义组件位置(默认:src/components)
        dirs: ["src/components", "src/**/components"],
        // 导入组件类型声明文件路径 (false:关闭自动生成)
        dts: false,
        //dts: "src/types/components.d.ts",
      }),
    ] as PluginOption[],
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
        // Element Plus 组件样式预构建（避免按需发现时触发页面重载）
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
      ],
    },
    // 构建配置（Vite 8 使用 Rolldown + Oxc）
    build: {
      chunkSizeWarningLimit: 1200, // chunk 大小警告阈值
      reportCompressedSize: false,
      cssMinify: "lightningcss", // Vite 8 默认使用 Lightning CSS 压缩
      // minify 默认使用 'oxc'，压缩速度比 terser 快 30-90 倍
      rolldownOptions: {
        output: {
          // 用于从入口点创建的块的打包输出格式
          entryFileNames: "js/[name].[hash].js",
          // 用于命名代码拆分时创建的共享块的输出命名
          chunkFileNames: "js/[name].[hash].js",
          // 用于输出静态资源的命名
          assetFileNames: (assetInfo: any) => {
            if (!assetInfo.name) {
              return "assets/[name].[hash][extname]";
            }
            const info = assetInfo.name.split(".");
            let extType = info[info.length - 1];
            if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)) {
              extType = "media";
            } else if (/\.(png|jpe?g|gif|svg)(\?.*)?$/.test(assetInfo.name)) {
              extType = "img";
            } else if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name)) {
              extType = "fonts";
            }
            return `${extType}/[name].[hash].[ext]`;
          },
        },
      },
    },
    define: {
      __APP_INFO__: JSON.stringify(__APP_INFO__),
    },
  };
});
