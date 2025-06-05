/**
 * 存储键常量统一管理
 * 包括 localStorage、sessionStorage 等各种存储的键名
 */

// 🔐 用户认证相关
export const ACCESS_TOKEN_KEY = "access_token";
export const REFRESH_TOKEN_KEY = "refresh_token";
export const REMEMBER_ME_KEY = "remember_me";

// 📊 数据缓存相关
export const DICT_CACHE_KEY = "dict_cache";

// 🎨 系统设置相关
export const SHOW_TAGS_VIEW_KEY = "showTagsView";
export const SHOW_APP_LOGO_KEY = "showAppLogo";
export const SHOW_WATERMARK_KEY = "showWatermark";
export const LAYOUT_KEY = "layout";
export const SIDEBAR_COLOR_SCHEME_KEY = "sidebarColorScheme";
export const THEME_KEY = "theme";
export const THEME_COLOR_KEY = "themeColor";

// 🎯 功能分组的键映射对象

// 认证相关键集合
export const AUTH_KEYS = {
  ACCESS_TOKEN: ACCESS_TOKEN_KEY,
  REFRESH_TOKEN: REFRESH_TOKEN_KEY,
  REMEMBER_ME: REMEMBER_ME_KEY,
} as const;

// 缓存相关键集合
export const CACHE_KEYS = {
  DICT_CACHE: DICT_CACHE_KEY,
} as const;

// 设置相关键集合
export const SETTINGS_KEYS = {
  SHOW_TAGS_VIEW: SHOW_TAGS_VIEW_KEY,
  SHOW_APP_LOGO: SHOW_APP_LOGO_KEY,
  SHOW_WATERMARK: SHOW_WATERMARK_KEY,
  SIDEBAR_COLOR_SCHEME: SIDEBAR_COLOR_SCHEME_KEY,
  LAYOUT: LAYOUT_KEY,
  THEME_COLOR: THEME_COLOR_KEY,
  THEME: THEME_KEY,
} as const;

// 📦 所有存储键的统一集合
export const ALL_STORAGE_KEYS = {
  ...AUTH_KEYS,
  ...CACHE_KEYS,
  ...SETTINGS_KEYS,
} as const;
