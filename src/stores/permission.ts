import type { RouteRecordRaw } from "vue-router";
import { constantRoutes } from "@/router";
import { resolveComponent } from "@/router/views";
import { store } from "@/stores";
import router from "@/router";
import { useUserStoreHook } from "@/stores/user";
import { isExternal, joinRoutePath } from "@/utils";

import MenuAPI from "@/api/system/menu";
import type { RouteItem } from "@/api/system/menu";

// 布局组件（懒加载）
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
      const menuRoutes = buildRoutes(routeData);
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
   * 移除已注册的动态路由（静态路由保留）
   *
   * @param routeList 待移除的路由清单
   */ const removeDynamicRoutes = (routeList: RouteRecordRaw[]) => {
    const constantNames = new Set(constantRoutes.map((route) => route.name).filter(Boolean));
    routeList.forEach((route) => {
      if (route.name && !constantNames.has(route.name)) {
        router.removeRoute(route.name);
      }
    });
  };

  /**
   * 重置路由状态
   */
  const resetRouter = () => {
    removeDynamicRoutes(routes.value);

    routes.value = [...constantRoutes];
    mixLayoutSideMenus.value = [];
    isRouteGenerated.value = false;
  };

  let pendingReload: Promise<RouteRecordRaw[]> | null = null;

  /**
   * 重新加载动态路由
   * 同一时刻只允许一个请求进行中；拉取期间旧路由保持在线， 摘旧与注册新之间无 await，导航无法插入，避免路由空窗触发 404 告警
   */ async function reloadRoutes(): Promise<RouteRecordRaw[]> {
    if (pendingReload) return pendingReload;

    pendingReload = (async () => {
      try {
        const staleRoutes = [...routes.value];
        const dynamicRoutes = await generateRoutes();

        removeDynamicRoutes(staleRoutes);
        dynamicRoutes.forEach((route: RouteRecordRaw) => {
          router.addRoute(route);
        });
        mixLayoutSideMenus.value = [];
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
   * 重新拉取用户信息后重建动态路由
   */ async function refreshPermissions(): Promise<void> {
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

// 目录菜单在 component 上的占位值，表示该级只作路由容器
const LAYOUT_COMPONENT = "Layout";

/**
 * 后端菜单树还原为 Vue Router 路由树
 * 顶层菜单统一由 Layout 承载：目录本身是容器，页面下沉为 path 为空的子路由； 路径前缀与默认跳转在此推导，菜单数据只描述业务信息
 */
const buildRoutes = (menus: RouteItem[]): RouteRecordRaw[] => menus.map(buildTopLevelRoute);

/**
 * 顶层菜单路由：套 Layout 壳，保证页面具备侧边栏与顶栏
 */
function buildTopLevelRoute(menu: RouteItem): RouteRecordRaw {
  // 新标签页外链不注册路由，保留原始数据供侧边栏直接跳转
  if (isExternalLink(menu)) return toExternalRoute(menu, menu.path as string);

  const path = joinRoutePath("", menu.path);
  const meta = { ...menu.meta };

  // 目录：自身就是侧边栏分组，标题与图标保留在壳层
  if (isContainer(menu)) {
    return {
      path,
      name: path,
      component: Layout,
      meta,
      redirect: menu.redirect || firstVisiblePath(menu.children, path),
      children: buildChildRoutes(menu.children, path),
    };
  }

  // 页面：壳层只承载显示状态，标题与图标下沉到页面子路由，避免面包屑与标签页多出一层
  return {
    path,
    name: path,
    component: Layout,
    meta: { hidden: meta.hidden },
    children: [
      {
        path: "",
        name: menu.name,
        component: resolveComponent(menu.component as string),
        meta,
        children: buildChildRoutes(menu.children, path),
      },
    ],
  };
}

/**
 * 子级菜单路由：目录保留为路径分组，页面挂载实际组件
 */
function buildChildRoutes(menus: RouteItem[] | undefined, basePath: string): RouteRecordRaw[] {
  return (menus ?? []).map((menu) => {
    const fullPath = joinRoutePath(basePath, menu.path);

    if (isExternalLink(menu)) return toExternalRoute(menu, fullPath);

    if (isContainer(menu)) {
      const children = buildChildRoutes(menu.children, fullPath);
      return {
        path: menu.path ?? "",
        meta: { ...menu.meta },
        children,
        ...(children.length
          ? { redirect: menu.redirect || firstVisiblePath(menu.children, fullPath) }
          : {}),
      };
    }

    return {
      path: menu.path ?? "",
      name: menu.name,
      component: resolveComponent(menu.component as string),
      meta: { ...menu.meta },
    };
  });
}

/**
 * 新标签页外链路由：不参与路由注册，仅保留侧边栏跳转所需信息
 */
function toExternalRoute(menu: RouteItem, path: string): RouteRecordRaw {
  const { children: _children, ...rest } = menu;
  return { ...rest, path } as RouteRecordRaw;
}

/**
 * 目录菜单：没有页面组件，只作路由容器
 */
function isContainer(menu: RouteItem): boolean {
  return !menu.component || menu.component === LAYOUT_COMPONENT;
}

/**
 * 新标签页外链：外链地址直接写在路由路径上且不带组件
 */
function isExternalLink(menu: RouteItem): boolean {
  return !menu.component && isExternal(menu.path ?? "");
}

/**
 * 默认跳转：第一个可见子菜单的完整路径
 */
function firstVisiblePath(menus: RouteItem[] | undefined, basePath: string): string | undefined {
  const first = (menus ?? []).find((menu) => !menu.meta?.hidden && !isExternal(menu.path ?? ""));
  return first ? joinRoutePath(basePath, first.path) : undefined;
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
