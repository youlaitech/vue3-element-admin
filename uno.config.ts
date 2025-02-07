// uno.config.ts
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from "unocss";

import { FileSystemIconLoader } from "@iconify/utils/lib/loader/node-loaders";

import fs from "fs";

const iconsDir = "./src/assets/icons";

// 读取本地 SVG 目录，自动生成 safelist
const generateSafeList = () => {
  try {
    return fs
      .readdirSync(iconsDir)
      .filter((file) => file.endsWith(".svg"))
      .map((file) => `i-svg:${file.replace(".svg", "")}`);
  } catch (error) {
    console.error("无法读取图标目录:", error);
    return [];
  }
};

export default defineConfig({
  shortcuts: {
    "flex-center": "flex justify-center items-center",
    "flex-x-center": "flex justify-center",
    "flex-y-center": "flex items-center",
    "wh-full": "w-full h-full",
    "flex-x-start": "flex items-center justify-start",
    "flex-x-between": "flex items-center justify-between",
    "flex-x-end": "flex items-center justify-end",
    "absolute-lt": "absolute left-0 top-0",
    "absolute-rt": "absolute right-0 top-0 ",
    "fixed-lt": "fixed left-0 top-0",
  },
  theme: {
    colors: {
      primary: "var(--el-color-primary)",
      primary_dark: "var(--el-color-primary-light-5)",
    },
  },
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      extraProperties: {
        display: "inline-block",
        width: "1em",
        height: "1em",
      },
      collections: {
        svg: FileSystemIconLoader(iconsDir, (svg) => {
          // 如果 `fill` 没有定义，则添加 `fill="currentColor"`
          if (!svg.includes('fill="')) {
            return svg.replace(/^<svg /, '<svg fill="currentColor" ');
          }
          return svg;
        }),
      },
    }),
    presetTypography(),
    presetWebFonts({
      fonts: {
        // ...
      },
    }),
  ],
  safelist: generateSafeList(),
  transformers: [transformerDirectives(), transformerVariantGroup()],
});
