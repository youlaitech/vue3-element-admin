/**
 * 应用配置
 */

import { LayoutMode, ComponentSize, SidebarColor, ThemeMode, LanguageEnum } from "@/enums";

const env = import.meta.env;
const { pkg } = __APP_INFO__;
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

// ============================================
// 应用配置
// ============================================
export const appConfig = {
  name: pkg.name as string,
  version: pkg.version as string,
  title: (env.VITE_APP_TITLE as string) || pkg.name,

  // 功能开关
  tenantEnabled: env.VITE_APP_TENANT_ENABLED === "true",
} as const;

// ============================================
// 用户偏好默认值
// ============================================
export const defaults = {
  theme: prefersDark ? ThemeMode.DARK : ThemeMode.LIGHT,
  themeColor: "#1677FF",
  sidebarColorScheme: SidebarColor.MINIMAL_WHITE,
  layout: LayoutMode.LEFT,
  size: ComponentSize.DEFAULT,
  language: LanguageEnum.ZH_CN,
  showTagsView: true,
  showAppLogo: true,
  showWatermark: false,
  pageSwitchingAnimation: "fade-slide",
  showSettings: true,
  watermarkContent: pkg.name,
} as const;

// ============================================
// 主题色预设
// ============================================
export const themeColorPresets = [
  "#1677FF",
  "#165DFF",
  "#3370FF",
  "#22C55E",
  "#FAAD14",
  "#FF4D4F",
  "#722ED1",
  "#EB2F96",
  "#13C2C2",
  "#F97316",
] as const;
