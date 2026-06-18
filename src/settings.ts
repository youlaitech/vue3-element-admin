/**
 * 应用配置
 */

import {
  LayoutMode,
  ComponentSize,
  SidebarColor,
  ThemeMode,
  LanguageEnum,
  TagsViewStyle,
} from "@/enums";

const env = import.meta.env;
const { pkg } = __APP_INFO__;
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

export const themeColorNames = ["primary", "success", "warning", "danger", "info"] as const;

export type ThemeColorName = (typeof themeColorNames)[number];

export type ThemeColorMap = Record<ThemeColorName, string>;

export interface ThemePalettePreset {
  id: string;
  name: string;
  description: string;
  colors: ThemeColorMap;
}

export const themePalettePresets = [
  {
    id: "arco",
    name: "ArcoD",
    description: "蓝橙对比清晰，适合现代中后台",
    colors: {
      primary: "#165DFF",
      success: "#00B42A",
      warning: "#FF7D00",
      danger: "#F53F3F",
      info: "#86909C",
    },
  },
  {
    id: "ant-design",
    name: "AntD",
    description: "规范稳重，适合标准业务系统",
    colors: {
      primary: "#1677FF",
      success: "#52C41A",
      warning: "#FAAD14",
      danger: "#FF4D4F",
      info: "#1677FF",
    },
  },
  {
    id: "element-plus",
    name: "ElementD",
    description: "贴近组件默认色识别",
    colors: {
      primary: "#409EFF",
      success: "#67C23A",
      warning: "#E6A23C",
      danger: "#F56C6C",
      info: "#909399",
    },
  },
] as const satisfies readonly ThemePalettePreset[];

export const defaultThemePalette = themePalettePresets[0];

export const appConfig = {
  name: pkg.name as string,
  version: pkg.version as string,
  title: (env.VITE_APP_TITLE as string) || pkg.name,

  // 功能开关
  tenantEnabled: env.VITE_APP_TENANT_ENABLED === "true",
} as const;

export const defaults = {
  theme: prefersDark ? ThemeMode.DARK : ThemeMode.LIGHT,
  themePalette: defaultThemePalette.id,
  themeColors: { ...defaultThemePalette.colors },
  sidebarColorScheme: SidebarColor.MINIMAL_WHITE,
  layout: LayoutMode.LEFT,
  size: ComponentSize.DEFAULT,
  language: LanguageEnum.ZH_CN,
  showTagsView: true,
  tagsViewStyle: TagsViewStyle.CARD,
  showAppLogo: true,
  showWatermark: false,
  pageSwitchingAnimation: "fade-slide",
  showSettings: true,
  watermarkContent: pkg.name,
} as const;
