
/**
 * 菜单查询参数类型声明
 */
export interface MenuQueryParam {
    name: String | undefined
}

/**
 * 菜单分页列表项声明
 */

export interface MenuItem {
    id: number;
    parentId: number;
    gmtCreate: string;
    gmtModified: string;
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
    id: number | undefined,
    /**
     * 父菜单ID
     */
    parentId: number,
    /**
     * 菜单名称
     */
    name: string,
    /**
     * 菜单是否可见(1:是;0:否;)
     */
    visible: number,
    icon: string,
    /**
     * 排序
     */
    sort: number,
    /**
     * 组件路径
     */
    component: string,
    /**
     * 路由路径
     */
    path: string,
    /**
     * 跳转路由路径
     */
    redirect: string,
}