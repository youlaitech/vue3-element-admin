/**
 * 常量统一导出
 *
 * @description
 * 包含应用中所有的常量定义
 */

/**
 * 超级管理员角色标识
 *
 * @description
 * 拥有系统最高权限，可以访问所有资源
 */
export const ROLE_ROOT = "ROOT";

/**
 * 应用存储前缀
 */
export const APP_PREFIX = "vea";

/**
 * 存储命名空间
 */
const NAMESPACES = {
  AUTH: "auth",
  TENANT: "tenant",
  SYSTEM: "system",
  UI: "ui",
  APP: "app",
} as const;

/**
 * 存储键名常量
 */
export const STORAGE_KEYS = {
  // ===== 认证相关 =====
  ACCESS_TOKEN: `${APP_PREFIX}:${NAMESPACES.AUTH}:access_token`,
  REFRESH_TOKEN: `${APP_PREFIX}:${NAMESPACES.AUTH}:refresh_token`,
  REMEMBER_ME: `${APP_PREFIX}:${NAMESPACES.AUTH}:remember_me`,

  // ===== 租户相关 =====
  TENANT_ID: `${APP_PREFIX}:${NAMESPACES.TENANT}:id`,
  TENANT_INFO: `${APP_PREFIX}:${NAMESPACES.TENANT}:info`,

  // ===== 系统相关 =====
  DICT_CACHE: `${APP_PREFIX}:${NAMESPACES.SYSTEM}:dict_cache`,

  // ===== UI 设置 =====
  SHOW_TAGS_VIEW: `${APP_PREFIX}:${NAMESPACES.UI}:show_tags_view`,
  SHOW_APP_LOGO: `${APP_PREFIX}:${NAMESPACES.UI}:show_app_logo`,
  SHOW_WATERMARK: `${APP_PREFIX}:${NAMESPACES.UI}:show_watermark`,
  ENABLE_AI_ASSISTANT: `${APP_PREFIX}:${NAMESPACES.UI}:enable_ai_assistant`,
  LAYOUT: `${APP_PREFIX}:${NAMESPACES.UI}:layout`,
  SIDEBAR_COLOR_SCHEME: `${APP_PREFIX}:${NAMESPACES.UI}:sidebar_color_scheme`,
  THEME: `${APP_PREFIX}:${NAMESPACES.UI}:theme`,
  THEME_COLOR: `${APP_PREFIX}:${NAMESPACES.UI}:theme_color`,

  // ===== 应用状态 =====
  DEVICE: `${APP_PREFIX}:${NAMESPACES.APP}:device`,
  SIZE: `${APP_PREFIX}:${NAMESPACES.APP}:size`,
  LANGUAGE: `${APP_PREFIX}:${NAMESPACES.APP}:language`,
  SIDEBAR_STATUS: `${APP_PREFIX}:${NAMESPACES.APP}:sidebar_status`,
  ACTIVE_TOP_MENU_PATH: `${APP_PREFIX}:${NAMESPACES.APP}:active_top_menu_path`,
} as const;

/**
 * 认证相关键名（便于批量操作）
 */
export const AUTH_KEYS = {
  ACCESS_TOKEN: STORAGE_KEYS.ACCESS_TOKEN,
  REFRESH_TOKEN: STORAGE_KEYS.REFRESH_TOKEN,
  REMEMBER_ME: STORAGE_KEYS.REMEMBER_ME,
} as const;

/**
 * 租户相关键名（便于批量操作）
 */
export const TENANT_KEYS = {
  TENANT_ID: STORAGE_KEYS.TENANT_ID,
  TENANT_INFO: STORAGE_KEYS.TENANT_INFO,
} as const;

/**
 * UI设置相关键名
 */
export const UI_KEYS = {
  SHOW_TAGS_VIEW: STORAGE_KEYS.SHOW_TAGS_VIEW,
  SHOW_APP_LOGO: STORAGE_KEYS.SHOW_APP_LOGO,
  SHOW_WATERMARK: STORAGE_KEYS.SHOW_WATERMARK,
  ENABLE_AI_ASSISTANT: STORAGE_KEYS.ENABLE_AI_ASSISTANT,
  LAYOUT: STORAGE_KEYS.LAYOUT,
  SIDEBAR_COLOR_SCHEME: STORAGE_KEYS.SIDEBAR_COLOR_SCHEME,
  THEME: STORAGE_KEYS.THEME,
  THEME_COLOR: STORAGE_KEYS.THEME_COLOR,
} as const;

/**
 * 应用状态相关键名
 */
export const APP_KEYS = {
  DEVICE: STORAGE_KEYS.DEVICE,
  SIZE: STORAGE_KEYS.SIZE,
  LANGUAGE: STORAGE_KEYS.LANGUAGE,
  SIDEBAR_STATUS: STORAGE_KEYS.SIDEBAR_STATUS,
  ACTIVE_TOP_MENU_PATH: STORAGE_KEYS.ACTIVE_TOP_MENU_PATH,
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
