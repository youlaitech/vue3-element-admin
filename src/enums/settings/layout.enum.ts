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
 * 设置抽屉底部操作区域布局模式
 */
export const enum ActionFooterMode {
  /**
   * 固定到底部（抽屉外层，覆盖）
   */
  FIXED_BOTTOM = "fixed_bottom",

  /**
   * 抽屉之内（随内容滚动，保持布局）
   */
  INSIDE_DRAWER = "inside_drawer",
}
