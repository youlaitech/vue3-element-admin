import "vue-router";

declare module "vue-router" {
  /**
   * 项目路由元信息扩展
   */
  interface RouteMeta {
    title?: string;
    icon?: string;
    hidden?: boolean;
    alwaysShow?: boolean;
    affix?: boolean;
    keepAlive?: boolean;
    breadcrumb?: boolean;
    activeMenu?: string;
    params?: Record<string, unknown>;
    roles?: string[];
  }
}
