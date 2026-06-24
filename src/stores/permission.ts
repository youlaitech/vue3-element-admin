import type { RouteRecordRaw } from "vue-router";
import { constantRoutes } from "@/router";
import { store } from "@/stores";
import router from "@/router";
import { useUserStoreHook } from "@/stores/user";
import { isExternal } from "@/utils";

import MenuAPI from "@/api/system/menu";
import type { RouteItem } from "@/api/system/menu";
const modules = import.meta.glob("../views/**/*.vue");
const Layout = () => import("../layouts/index.vue");

export const usePermissionStore = defineStore("permission", () => {
  const routes = ref<RouteRecordRaw[]>([]);
  const mixLayoutSideMenus = ref<RouteRecordRaw[]>([]);
  const isRouteGenerated = ref(false);

  /**
   * 生成动态路由
   */
  async function generateRoutes(): Promise<RouteRecordRaw[]> {
    try {
      const routeData = await MenuAPI.getRoutes();
      const menuRoutes = transformRoutes(routeData);
      const registerRoutes = filterRoutes(menuRoutes);

      routes.value = [...constantRoutes, ...menuRoutes];
      isRouteGenerated.value = true;

      return registerRoutes;
    } catch (error) {
      isRouteGenerated.value = false;
      throw error;
    }
  }

  /**
   * 设置混合布局左侧菜单
   */
  const setMixLayoutSideMenus = (parentPath: string) => {
    const parentMenu = routes.value.find((item: RouteRecordRaw) => item.path === parentPath);
    mixLayoutSideMenus.value = parentMenu?.children || [];
  };

  /**
   * 重置路由状态
   */
  const resetRouter = () => {
    const constantNames = new Set(constantRoutes.map((route) => route.name).filter(Boolean));
    routes.value.forEach((route: RouteRecordRaw) => {
      if (route.name && !constantNames.has(route.name)) {
        router.removeRoute(route.name);
      }
    });

    routes.value = [...constantRoutes];
    mixLayoutSideMenus.value = [];
    isRouteGenerated.value = false;
  };

  let pendingReload: Promise<RouteRecordRaw[]> | null = null;

  /**
   * 重新加载动态路由
   *
   * 同一时刻只允许一个请求进行中
   */
  async function reloadRoutes(): Promise<RouteRecordRaw[]> {
    if (pendingReload) return pendingReload;

    pendingReload = (async () => {
      try {
        resetRouter();
        const dynamicRoutes = await generateRoutes();
        dynamicRoutes.forEach((route: RouteRecordRaw) => {
          router.addRoute(route);
        });
        return dynamicRoutes;
      } finally {
        pendingReload = null;
      }
    })();

    return pendingReload;
  }

  let pendingPermissionRefresh: Promise<void> | null = null;

  /**
   * 刷新权限
   *
   * 重新拉取用户信息后重建动态路由
   */
  async function refreshPermissions(): Promise<void> {
    if (pendingPermissionRefresh) return pendingPermissionRefresh;

    pendingPermissionRefresh = (async () => {
      try {
        const userStore = useUserStoreHook();
        await userStore.getUserInfo();
        await reloadRoutes();
      } finally {
        pendingPermissionRefresh = null;
      }
    })();

    return pendingPermissionRefresh;
  }

  return {
    routes,
    mixLayoutSideMenus,
    isRouteGenerated,
    generateRoutes,
    setMixLayoutSideMenus,
    resetRouter,
    reloadRoutes,
    refreshPermissions,
  };
});

/**
 * 将后端路由数据转为 Vue Router 配置
 */
const transformRoutes = (routes: RouteItem[], isTopLevel: boolean = true): RouteRecordRaw[] => {
  return routes.map((route) => {
    const { children, ...args } = route;
    const componentPath = route.component;

    // 非顶层目录壳去掉 Layout 组件，仅保留路由结构
    const resolvedComponent = isTopLevel || componentPath !== "Layout" ? componentPath : undefined;

    const normalizedRoute = { ...args } as RouteRecordRaw;

    if (!resolvedComponent) {
      normalizedRoute.component = undefined;
    } else {
      normalizedRoute.component =
        resolvedComponent === "Layout" ? Layout : resolveComponent(resolvedComponent);
    }

    if (children && children.length > 0) {
      normalizedRoute.children = transformRoutes(children, false);
    }

    return normalizedRoute;
  });
};

/**
 * 解析组件
 *
 * 支持 xxx.vue 与 xxx/index.vue 两种写法，未命中时回退到 404
 */
function resolveComponent(componentPath: string) {
  const normalized = componentPath
    .trim()
    .replace(/^\/+/, "")
    .replace(/\.vue$/i, "");
  return (
    modules[`../views/${normalized}.vue`] ||
    modules[`../views/${normalized}/index.vue`] ||
    modules[`../views/error/404.vue`]
  );
}

/**
 * 过滤掉不注册为 Vue Router 路由的外链
 */
function filterRoutes(routes: RouteRecordRaw[]): RouteRecordRaw[] {
  return routes.reduce<RouteRecordRaw[]>((result, route) => {
    if (isExternal(route.path)) return result;

    const filtered = { ...route };
    const children = route.children ? filterRoutes(route.children) : [];

    if (children.length > 0) {
      filtered.children = children;
    } else {
      delete filtered.children;
    }

    result.push(filtered);
    return result;
  }, []);
}

/**
 * 非组件环境获取 permission store
 */
export function usePermissionStoreHook() {
  return usePermissionStore(store);
}
