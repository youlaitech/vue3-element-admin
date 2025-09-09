/**
 * 项目常量统一管理
 *
 * 存储键命名规范：
 * - 使用小写 + 冒号分隔 + 名称空间
 * - 格式：myapp:user:token
 * - 便于清理和避免冲突
 * - 当需要版本升级、兼容旧数据，可在 key 中加入版本如 myapp:v2:user:token。
 */

// 🏷️ 应用前缀常量
export const APP_PREFIX = "vea";

// 📦 存储键统一管理
export const STORAGE_KEYS = {
  // 🔐 用户认证相关
  ACCESS_TOKEN: `${APP_PREFIX}:auth:access_token`, // JWT 访问令牌，用于 API 请求认证
  REFRESH_TOKEN: `${APP_PREFIX}:auth:refresh_token`, // JWT 刷新令牌，用于获取新的访问令牌
  REMEMBER_ME: `${APP_PREFIX}:auth:remember_me`, // 记住登录状态，控制登录持久化

  // 🏗️ 系统核心相关
  DICT_CACHE: `${APP_PREFIX}:system:dict_cache`, // 字典数据缓存，存储系统字典配置信息

  // 🎨 系统设置相关
  SHOW_TAGS_VIEW: `${APP_PREFIX}:ui:show_tags_view`, // 是否显示标签页视图
  SHOW_APP_LOGO: `${APP_PREFIX}:ui:show_app_logo`, // 是否显示应用 Logo
  SHOW_WATERMARK: `${APP_PREFIX}:ui:show_watermark`, // 是否显示水印
  LAYOUT: `${APP_PREFIX}:ui:layout`, // 布局模式：vertical(垂直) | horizontal(水平) | mix(混合)
  SIDEBAR_COLOR_SCHEME: `${APP_PREFIX}:ui:sidebar_color_scheme`, // 侧边栏颜色方案：light(浅色) | dark(深色)
  THEME: `${APP_PREFIX}:ui:theme`, // 主题模式：light(浅色) | dark(深色) | auto(自动)
  THEME_COLOR: `${APP_PREFIX}:ui:theme_color`, // 主题色，用于自定义主题色彩

  // 📱 应用状态相关
  DEVICE: `${APP_PREFIX}:app:device`, // 设备类型：desktop(桌面) | mobile(移动端) | tablet(平板)
  SIZE: `${APP_PREFIX}:app:size`, // 屏幕尺寸：large(大) | medium(中) | small(小)
  LANGUAGE: `${APP_PREFIX}:app:language`, // 应用语言：zh-CN(中文) | en-US(英文) 等
  SIDEBAR_STATUS: `${APP_PREFIX}:app:sidebar_status`, // 侧边栏状态：opened(展开) | closed(收起)
  ACTIVE_TOP_MENU_PATH: `${APP_PREFIX}:app:active_top_menu_path`, // 当前激活的顶部菜单路径
} as const;

// 🎯 功能分组的键映射对象（向后兼容）
// 这些分组对象提供了按功能分类的存储键访问方式，便于在特定场景下批量操作

// 👤 用户角色相关
export const ROLE_ROOT = "ROOT"; // 超级管理员角色标识

// 🔐 认证相关键集合
// 包含所有与用户认证、授权相关的存储键
export const AUTH_KEYS = {
  ACCESS_TOKEN: STORAGE_KEYS.ACCESS_TOKEN, // JWT 访问令牌
  REFRESH_TOKEN: STORAGE_KEYS.REFRESH_TOKEN, // JWT 刷新令牌
  REMEMBER_ME: STORAGE_KEYS.REMEMBER_ME, // 记住登录状态
} as const;

// 🏗️ 系统核心相关键集合
// 包含系统核心功能相关的存储键
export const SYSTEM_KEYS = {
  DICT_CACHE: STORAGE_KEYS.DICT_CACHE, // 字典数据缓存
} as const;

// 🎨 设置相关键集合
// 包含所有用户界面设置和主题相关的存储键
export const SETTINGS_KEYS = {
  SHOW_TAGS_VIEW: STORAGE_KEYS.SHOW_TAGS_VIEW, // 是否显示标签页视图
  SHOW_APP_LOGO: STORAGE_KEYS.SHOW_APP_LOGO, // 是否显示应用 Logo
  SHOW_WATERMARK: STORAGE_KEYS.SHOW_WATERMARK, // 是否显示水印
  SIDEBAR_COLOR_SCHEME: STORAGE_KEYS.SIDEBAR_COLOR_SCHEME, // 侧边栏颜色方案
  LAYOUT: STORAGE_KEYS.LAYOUT, // 布局模式
  THEME_COLOR: STORAGE_KEYS.THEME_COLOR, // 主题色
  THEME: STORAGE_KEYS.THEME, // 主题模式
} as const;

// 📱 应用状态相关键集合
// 包含应用运行时状态相关的存储键
export const APP_KEYS = {
  DEVICE: STORAGE_KEYS.DEVICE, // 设备类型
  SIZE: STORAGE_KEYS.SIZE, // 屏幕尺寸
  LANGUAGE: STORAGE_KEYS.LANGUAGE, // 应用语言
  SIDEBAR_STATUS: STORAGE_KEYS.SIDEBAR_STATUS, // 侧边栏状态
  ACTIVE_TOP_MENU_PATH: STORAGE_KEYS.ACTIVE_TOP_MENU_PATH, // 当前激活的顶部菜单路径
} as const;

// 📦 所有存储键的统一集合
// 包含所有存储键的完整映射，用于批量操作或遍历
export const ALL_STORAGE_KEYS = {
  ...AUTH_KEYS, // 认证相关键
  ...SYSTEM_KEYS, // 系统核心键
  ...SETTINGS_KEYS, // 设置相关键
  ...APP_KEYS, // 应用状态键
} as const;

// 🔧 类型定义
export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

// 🧹 存储清理工具
export const STORAGE_UTILS = {
  // 清理所有项目相关的存储
  clearAll: () => {
    const keys = Object.values(STORAGE_KEYS);
    keys.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
  },

  // 清理特定分类的存储
  clearByCategory: (category: "auth" | "system" | "ui" | "app") => {
    const prefix = `${APP_PREFIX}:${category}:`;
    const keys = Object.values(STORAGE_KEYS).filter((key) => key.startsWith(prefix));
    keys.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
  },

  // 获取所有项目相关的存储键
  getAllKeys: () => Object.values(STORAGE_KEYS),
} as const;
