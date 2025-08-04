import { useRoute } from "vue-router";
import { useAppStore, usePermissionStore } from "@/store";

/**
 * 布局菜单处理逻辑
 */
export function useLayoutMenu() {
  const route = useRoute();
  const appStore = useAppStore();
  const permissionStore = usePermissionStore();

  // 顶部菜单激活路径
  const activeTopMenuPath = computed(() => appStore.activeTopMenuPath);

  // 常规路由（左侧菜单或顶部菜单）
  const routes = computed(() => permissionStore.routes);

  // 混合布局左侧菜单路由
  const sideMenuRoutes = computed(() => permissionStore.mixLayoutSideMenus);

  // 当前激活的菜单
  const activeMenu = computed(() => {
    const { meta, path } = route;

    // 如果设置了activeMenu，则使用
    if (meta?.activeMenu) {
      return meta.activeMenu;
    }

    return path;
  });

  return {
    routes,
    sideMenuRoutes,
    activeMenu,
    activeTopMenuPath,
  };
}
