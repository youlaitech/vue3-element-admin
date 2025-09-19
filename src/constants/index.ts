/**
 * 项目常量统一管理
 * 存储键命名规范：{prefix}:{namespace}:{key}
 */

export const APP_PREFIX = "vea";

export const STORAGE_KEYS = {
  // 用户认证相关
  ACCESS_TOKEN: `${APP_PREFIX}:auth:access_token`, // JWT访问令牌
  REFRESH_TOKEN: `${APP_PREFIX}:auth:refresh_token`, // JWT刷新令牌
  REMEMBER_ME: `${APP_PREFIX}:auth:remember_me`, // 记住登录状态

  // 系统核心相关
  DICT_CACHE: `${APP_PREFIX}:system:dict_cache`, // 字典数据缓存

  // UI设置相关
  SHOW_TAGS_VIEW: `${APP_PREFIX}:ui:show_tags_view`, // 显示标签页视图
  SHOW_APP_LOGO: `${APP_PREFIX}:ui:show_app_logo`, // 显示应用Logo
  SHOW_WATERMARK: `${APP_PREFIX}:ui:show_watermark`, // 显示水印
  LAYOUT: `${APP_PREFIX}:ui:layout`, // 布局模式
  SIDEBAR_COLOR_SCHEME: `${APP_PREFIX}:ui:sidebar_color_scheme`, // 侧边栏配色方案
  THEME: `${APP_PREFIX}:ui:theme`, // 主题模式
  THEME_COLOR: `${APP_PREFIX}:ui:theme_color`, // 主题色

  // 应用状态相关
  DEVICE: `${APP_PREFIX}:app:device`, // 设备类型
  SIZE: `${APP_PREFIX}:app:size`, // 屏幕尺寸
  LANGUAGE: `${APP_PREFIX}:app:language`, // 应用语言
  SIDEBAR_STATUS: `${APP_PREFIX}:app:sidebar_status`, // 侧边栏状态
  ACTIVE_TOP_MENU_PATH: `${APP_PREFIX}:app:active_top_menu_path`, // 当前激活的顶部菜单路径
} as const;

export const ROLE_ROOT = "ROOT"; // 超级管理员角色

// 分组键集合（便于批量操作）
export const AUTH_KEYS = {
  ACCESS_TOKEN: STORAGE_KEYS.ACCESS_TOKEN,
  REFRESH_TOKEN: STORAGE_KEYS.REFRESH_TOKEN,
  REMEMBER_ME: STORAGE_KEYS.REMEMBER_ME,
} as const;

export const SYSTEM_KEYS = {
  DICT_CACHE: STORAGE_KEYS.DICT_CACHE,
} as const;

export const SETTINGS_KEYS = {
  SHOW_TAGS_VIEW: STORAGE_KEYS.SHOW_TAGS_VIEW,
  SHOW_APP_LOGO: STORAGE_KEYS.SHOW_APP_LOGO,
  SHOW_WATERMARK: STORAGE_KEYS.SHOW_WATERMARK,
  SIDEBAR_COLOR_SCHEME: STORAGE_KEYS.SIDEBAR_COLOR_SCHEME,
  LAYOUT: STORAGE_KEYS.LAYOUT,
  THEME_COLOR: STORAGE_KEYS.THEME_COLOR,
  THEME: STORAGE_KEYS.THEME,
} as const;

export const APP_KEYS = {
  DEVICE: STORAGE_KEYS.DEVICE,
  SIZE: STORAGE_KEYS.SIZE,
  LANGUAGE: STORAGE_KEYS.LANGUAGE,
  SIDEBAR_STATUS: STORAGE_KEYS.SIDEBAR_STATUS,
  ACTIVE_TOP_MENU_PATH: STORAGE_KEYS.ACTIVE_TOP_MENU_PATH,
} as const;

export const ALL_STORAGE_KEYS = {
  ...AUTH_KEYS,
  ...SYSTEM_KEYS,
  ...SETTINGS_KEYS,
  ...APP_KEYS,
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
