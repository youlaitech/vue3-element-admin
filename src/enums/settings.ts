/**
 * 设置相关枚举
 *
 * @description
 * 包含主题、布局、语言、设备等应用设置的枚举定义
 */

/**
 * 主题模式枚举
 */
export const enum ThemeMode {
  /**
   * 明亮主题
   */
  LIGHT = "light",
  /**
   * 暗黑主题
   */
  DARK = "dark",

  /**
   * 系统自动
   */
  AUTO = "auto",
}

/**
 * 侧边栏配色方案枚举
 */
export const enum SidebarColor {
  /**
   * 经典蓝
   */
  CLASSIC_BLUE = "classic-blue",
  /**
   * 极简白
   */
  MINIMAL_WHITE = "minimal-white",
}

/**
 * 菜单布局枚举
 */
export const enum LayoutMode {
  /**
   * 左侧菜单布局
   */
  LEFT = "left",
  /**
   * 顶部菜单布局
   */
  TOP = "top",

  /**
   * 混合菜单布局
   */
  MIX = "mix",
}

/**
 * 侧边栏状态枚举
 */
export const enum SidebarStatus {
  /**
   * 展开
   */
  OPENED = "opened",

  /**
   * 关闭
   */
  CLOSED = "closed",
}

/**
 * 组件尺寸枚举
 */
export const enum ComponentSize {
  /**
   * 默认
   */
  DEFAULT = "default",

  /**
   * 大型
   */
  LARGE = "large",

  /**
   * 小型
   */
  SMALL = "small",
}

/**
 * 语言枚举
 */
export const enum LanguageEnum {
  /**
   * 中文
   */
  ZH_CN = "zh-cn",

  /**
   * 英文
   */
  EN = "en",
}

/**
 * 设备枚举
 */
export const enum DeviceEnum {
  /**
   * 宽屏设备
   */
  DESKTOP = "desktop",

  /**
   * 窄屏设备
   */
  MOBILE = "mobile",
}
