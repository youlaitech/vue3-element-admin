/**
 * 菜单查询参数类型声明
 */
export interface MenuQueryParam {
  name: string;
}

/**
 * 菜单分页列表项声明
 */

export interface MenuItem {
  id?: number;
  parentId: number;
  type?: string | 'CATEGORY' | 'MENU' | 'EXTLINK';
  createTime: string;
  updateTime: string;
  name: string;
  icon: string;
  component: string;
  sort: number;
  visible: number;
  children: MenuItem[];
}

/**
 * 菜单表单类型声明
 */
export interface MenuFormData {
  /**
   * 菜单ID
   */
  id?: string;
  /**
   * 父菜单ID
   */
  parentId: string;
  /**
   * 菜单名称
   */
  name: string;
  /**
   * 菜单是否可见(1:是;0:否;)
   */
  visible: number;
  icon?: string;
  /**
   * 排序
   */
  sort: number;
  /**
   * 组件路径
   */
  component?: string;
  /**
   * 路由路径
   */
  path: string;
  /**
   * 跳转路由路径
   */
  redirect?: string;

  /**
   * 菜单类型(1:菜单；2：目录；3：外链)
   */
  type: string;
}

/**
 * 资源(菜单+权限)类型
 */
export interface Resource {
  /**
   * 菜单值
   */
  value: string;
  /**
   * 菜单文本
   */
  label: string;
  /**
   * 子菜单
   */
  children: Resource[];
  /**
   * 权限集合
   */
  perms: Permission[];
}

/**
 * 权限类型
 */
export interface Permission {
  /**
   * 权限值
   */
  value: string;
  /**
   * 权限文本
   */
  label: string;
}
