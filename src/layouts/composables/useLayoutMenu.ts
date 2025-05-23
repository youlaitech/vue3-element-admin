import { computed, watch } from "vue";
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
  const sideMenuRoutes = computed(() => permissionStore.sideMenuRoutes);

  // 当前激活的菜单
  const activeMenu = computed(() => {
    const { meta, path } = route;

    // 如果设置了activeMenu，则使用
    if (meta?.activeMenu) {
      return meta.activeMenu;
    }

    return path;
  });

  // 监听顶部菜单路径变化，更新侧边菜单
  watch(
    () => activeTopMenuPath.value,
    (newPath) => {
      permissionStore.updateSideMenu(newPath);
    },
    { immediate: true }
  );

  /**
   * 处理顶部菜单点击
   * @param path 菜单路径
   */
  function handleTopMenuClick(path: string) {
    appStore.activeTopMenu(path);
  }

  return {
    routes,
    sideMenuRoutes,
    activeMenu,
    activeTopMenuPath,
    handleTopMenuClick,
  };
}
