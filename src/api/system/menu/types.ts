// Menu 菜单类型定义

/**
 * 菜单查询参数
 */
export interface MenuQueryParams {
  /** 搜索关键字 */
  keywords?: string;
}

/**
 * 菜单视图对象
 */
export interface MenuItem {
  /** 子菜单 */
  children?: MenuItem[];
  /** 组件路径 */
  component?: string;
  /** 外链地址 */
  externalUrl?: string;
  /** ICON */
  icon?: string;
  /** 菜单 ID */
  id?: string;
  /** 菜单名称 */
  name?: string;
  /** 父菜单 ID */
  parentId?: string;
  /** 路由名称 */
  routeName?: string;
  /** 路由路径 */
  routePath?: string;
  /** 路由路径 */
  path?: string;
  /** 按钮权限标识 */
  perm?: string;
  /** 跳转路径 */
  redirect?: string;
  /** 是否缓存 */
  keepAlive?: number | boolean;
  /** 路由参数 */
  params?: { key?: string; value?: string }[];
  /** 菜单排序(数字越小排名越靠前) */
  sort?: number;
  /** 菜单类型（C-目录 M-菜单 E-外链 B-按钮） */
  type?: string;
  /** 菜单是否可见(1:显示;0:隐藏) */
  visible?: number;
  /** 菜单范围(1=平台 2=业务) */
  scope?: number;
}

/**
 * 菜单表单对象
 */
export interface MenuForm {
  /** 菜单 ID */
  id?: string;
  /** 父菜单 ID */
  parentId?: string;
  /** 菜单名称 */
  name?: string;
  /** 菜单类型（C-目录 M-菜单 E-外链 B-按钮） */
  type?: string;
  /** 路由路径 */
  path?: string;
  /** 路由名称（用于前端路由名） */
  routeName?: string;
  /** 路由路径（可用于自定义路由字段） */
  routePath?: string;
  /** 跳转路径 */
  redirect?: string;
  /** 组件路径 */
  component?: string;
  /** 外链地址 */
  externalUrl?: string;
  /** ICON */
  icon?: string;
  /** 排序 */
  sort?: number;
  /** 菜单是否可见 */
  visible?: number;
  /** 菜单范围(1=平台 2=业务) */
  scope?: number;
  /** 按钮权限标识 */
  perm?: string;
  /** 路由参数（用于表单编辑 params） */
  params?: { key?: string; value?: string }[];
  /** 是否缓存（用于 keepAlive） */
  keepAlive?: number | boolean;
  /** 新增页面菜单时是否生成增删改查按钮 */
  generateCrudButtons?: boolean;
  /** 按钮权限标识前缀，如 sys:user */
  buttonPermPrefix?: string;
}

/**
 * AI 推断的菜单配置
 */
export interface MenuAiResult {
  /** 访问路径 */
  routePath?: string;
  /** 权限标识 */
  perm?: string;
  /** 建议的图标关键词，按贴切程度排列 */
  iconKeywords?: string[];
}

/**
 * 菜单选项
 */
export interface MenuOption {
  key: string;
  value: string;
}

/**
 * 路由对象
 */
export interface RouteItem {
  /** 子路由列表 */
  children: RouteItem[];
  /** 组件路径 */
  component?: string;
  /** 路由名称 */
  name?: string;
  /** 路由路径 */
  path?: string;
  /** 路由属性 */
  meta?: Meta;
  /** 跳转链接 */
  redirect?: string;
}

/**
 * 路由属性
 */
export interface Meta {
  /** 是否隐藏(true-是 false-否) */
  hidden?: boolean;
  /** ICON */
  icon?: string;
  /** 【菜单】是否开启页面缓存 */
  keepAlive?: boolean;
  /** 路由参数 */
  params?: Record<string, unknown>;
  /** 外链地址 */
  externalUrl?: string;
  /** 角色集合 */
  roles?: string[];
  /** 路由 title */
  title?: string;
}
