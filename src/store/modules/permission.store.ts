import type { RouteRecordRaw } from "vue-router";
import { constantRoutes } from "@/router";
import { store } from "@/store";
import router from "@/router";

import MenuAPI, { type RouteVO } from "@/api/system/menu.api";
const modules = import.meta.glob("../../views/**/**.vue");
const Layout = () => import("@/layouts/index.vue");

export const usePermissionStore = defineStore("permission", () => {
  // 所有路由（静态路由 + 动态路由）
  const routes = ref<RouteRecordRaw[]>([]);
  // 混合布局的左侧菜单路由
  const mixLayoutSideMenus = ref<RouteRecordRaw[]>([]);
  // 动态路由是否已生成
  const isDynamicRoutesGenerated = ref(false);

  /**
   * 生成动态路由
   */
  async function generateRoutes(): Promise<RouteRecordRaw[]> {
    try {
      const data = await MenuAPI.getRoutes();
      const dynamicRoutes = parseDynamicRoutes(data);

      routes.value = [...constantRoutes, ...dynamicRoutes];
      isDynamicRoutesGenerated.value = true;

      return dynamicRoutes;
    } catch (error) {
      console.error("❌ Failed to generate routes:", error);
      isDynamicRoutesGenerated.value = false;
      throw error;
    }
  }

  /**
   * 设置混合布局的左侧菜单
   */
  const setMixLayoutSideMenus = (parentPath: string) => {
    const parentMenu = routes.value.find((item) => item.path === parentPath);
    mixLayoutSideMenus.value = parentMenu?.children || [];
  };

  /**
   * 重置路由状态
   */
  const resetRouter = () => {
    // 移除动态路由
    const constantRouteNames = new Set(constantRoutes.map((route) => route.name).filter(Boolean));
    routes.value.forEach((route) => {
      if (route.name && !constantRouteNames.has(route.name)) {
        router.removeRoute(route.name);
      }
    });

    // 重置状态
    routes.value = [...constantRoutes];
    mixLayoutSideMenus.value = [];
    isDynamicRoutesGenerated.value = false;
  };

  return {
    routes,
    mixLayoutSideMenus,
    isDynamicRoutesGenerated,
    generateRoutes,
    setMixLayoutSideMenus,
    resetRouter,
  };
});

/**
 * 解析后端返回的路由数据并转换为 Vue Router 兼容的路由配置
 *
 * @param rawRoutes 后端返回的原始路由数据
 * @returns 解析后的路由集合
 */
const parseDynamicRoutes = (rawRoutes: RouteVO[]): RouteRecordRaw[] => {
  const parsedRoutes: RouteRecordRaw[] = [];

  rawRoutes.forEach((route) => {
    const normalizedRoute = { ...route } as RouteRecordRaw;

    // 处理组件路径
    normalizedRoute.component =
      normalizedRoute.component?.toString() === "Layout"
        ? Layout
        : modules[`../../views/${normalizedRoute.component}.vue`] ||
          modules["../../views/error-page/404.vue"];

    // 递归解析子路由
    if (normalizedRoute.children) {
      normalizedRoute.children = parseDynamicRoutes(route.children);
    }

    parsedRoutes.push(normalizedRoute);
  });

  return parsedRoutes;
};

/**
 * 导出此hook函数用于在非组件环境(如其他store、工具函数等)中获取权限store实例
 *
 * 在组件中可直接使用usePermissionStore()，但在组件外部需要传入store实例
 * 此函数简化了这个过程，避免每次都手动传入store参数
 */
export function usePermissionStoreHook() {
  return usePermissionStore(store);
}
