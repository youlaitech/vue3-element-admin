import type { LocationQueryRaw, RouteRecordRaw } from "vue-router";
import { useLayout } from "./useLayout";
import { useAppStore, usePermissionStore } from "@/stores";
import { isExternal } from "@/utils/index";

export function useMixMenu() {
  const route = useRoute();
  const router = useRouter();

  const appStore = useAppStore();
  const permissionStore = usePermissionStore();

  const { activeTopMenuPath, sideMenuRoutes } = useLayout();

  /**
   * 生成顶部菜单，单子菜单路由提升为顶级入口
   */
  const topMenuItems = computed(() => {
    const routes = permissionStore.routes.filter((item) => !item.meta?.hidden);

    return routes.map((route) => {
      if (route.meta?.alwaysShow || !route.children?.length) return route;

      const visibleChildren = route.children.filter((child) => !child.meta?.hidden);

      if (visibleChildren.length === 1) {
        const child = visibleChildren[0];
        return {
          ...route,
          meta: {
            ...route.meta,
            title: child.meta?.title || route.meta?.title,
            icon: child.meta?.icon || route.meta?.icon,
          },
        };
      }
      return route;
    });
  });

  /**
   * 解析当前侧边菜单激活路径
   */
  const activeSideMenuPath = computed(() => {
    const { meta, path } = route;
    return typeof meta?.activeMenu === "string" ? meta.activeMenu : path;
  });

  /**
   * 解析混合布局侧边菜单路径
   */
  function resolvePath(routePath: string): string {
    if (isExternal(routePath)) return routePath;
    if (routePath.startsWith("/")) return activeTopMenuPath.value + routePath;
    return `${activeTopMenuPath.value}/${routePath}`;
  }

  /**
   * 从当前路由提取顶部菜单路径
   */
  function extractTopMenuPath(path: string): string {
    return path.split("/").filter(Boolean).length > 1 ? path.match(/^\/[^/]+/)?.[0] || "/" : "/";
  }

  /**
   * 切换顶部菜单并进入第一个可访问页面
   */
  function handleTopMenuSelect(menuPath: string) {
    if (menuPath === activeTopMenuPath.value) return;

    appStore.setActiveTopMenuPath(menuPath);
    permissionStore.setMixLayoutSideMenus(menuPath);
    navigateToFirstMenu(permissionStore.mixLayoutSideMenus);
  }

  /**
   * 进入菜单树中的第一个叶子页面
   */
  function navigateToFirstMenu(menus: RouteRecordRaw[]) {
    if (!menus.length) return;

    const [first] = menus;
    if (first.children?.length) {
      navigateToFirstMenu(first.children as RouteRecordRaw[]);
    } else if (first.name) {
      router.push({
        name: first.name,
        query:
          typeof first.meta?.params === "object"
            ? (first.meta.params as LocationQueryRaw)
            : undefined,
      });
    }
  }

  /**
   * 路由变化时保持顶部菜单和侧边菜单同步
   */
  watch(
    () => route.path,
    (newPath) => {
      const topMenuPath = extractTopMenuPath(newPath);
      const isTopMenuChanged = topMenuPath !== activeTopMenuPath.value;

      if (isTopMenuChanged) {
        appStore.setActiveTopMenuPath(topMenuPath);
      }

      if (isTopMenuChanged || permissionStore.mixLayoutSideMenus.length === 0) {
        permissionStore.setMixLayoutSideMenus(topMenuPath);
      }
    },
    { immediate: true }
  );

  return {
    topMenuItems,
    activeSideMenuPath,
    activeTopMenuPath,
    sideMenuRoutes,
    resolvePath,
    handleTopMenuSelect,
  };
}
