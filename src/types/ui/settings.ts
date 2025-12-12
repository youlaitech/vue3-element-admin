/**
 * 应用设置相关类型定义
 */

import type { ThemeMode } from "@/enums";

export interface AppSettings {
  title: string;
  version: string;
  showSettings: boolean;
  showTagsView: boolean;
  showAppLogo: boolean;
  layout: "left" | "top" | "mix";
  themeColor: string;
  theme: ThemeMode;
  size: string;
  language: string;
  showWatermark: boolean;
  watermarkContent: string;
  sidebarColorScheme: "classic-blue" | "minimal-white";
  enableAiAssistant: boolean;
}
