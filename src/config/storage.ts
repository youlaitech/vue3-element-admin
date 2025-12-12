/**
 * 本地存储键名配置
 *
 * @description
 * 统一管理 localStorage/sessionStorage 的键名
 * 命名规范：{prefix}:{namespace}:{key}
 */

export const APP_PREFIX = "vea";

/**
 * 存储键名常量
 */
export const STORAGE_KEYS = {
  // ===== 认证相关 =====
  ACCESS_TOKEN: `${APP_PREFIX}:auth:access_token`,
  REFRESH_TOKEN: `${APP_PREFIX}:auth:refresh_token`,
  REMEMBER_ME: `${APP_PREFIX}:auth:remember_me`,

  // ===== 租户相关 =====
  TENANT_ID: `${APP_PREFIX}:tenant:id`,
  TENANT_INFO: `${APP_PREFIX}:tenant:info`,

  // ===== 系统相关 =====
  DICT_CACHE: `${APP_PREFIX}:system:dict_cache`,

  // ===== UI 设置 =====
  SHOW_TAGS_VIEW: `${APP_PREFIX}:ui:show_tags_view`,
  SHOW_APP_LOGO: `${APP_PREFIX}:ui:show_app_logo`,
  SHOW_WATERMARK: `${APP_PREFIX}:ui:show_watermark`,
  ENABLE_AI_ASSISTANT: `${APP_PREFIX}:ui:enable_ai_assistant`,
  LAYOUT: `${APP_PREFIX}:ui:layout`,
  SIDEBAR_COLOR_SCHEME: `${APP_PREFIX}:ui:sidebar_color_scheme`,
  THEME: `${APP_PREFIX}:ui:theme`,
  THEME_COLOR: `${APP_PREFIX}:ui:theme_color`,

  // ===== 应用状态 =====
  DEVICE: `${APP_PREFIX}:app:device`,
  SIZE: `${APP_PREFIX}:app:size`,
  LANGUAGE: `${APP_PREFIX}:app:language`,
  SIDEBAR_STATUS: `${APP_PREFIX}:app:sidebar_status`,
  ACTIVE_TOP_MENU_PATH: `${APP_PREFIX}:app:active_top_menu_path`,
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
