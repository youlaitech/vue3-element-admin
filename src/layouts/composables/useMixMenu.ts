/**
 * 混合布局菜单逻辑
 *
 * 从 MixLayout.vue 提取，负责：
 *   - 顶部菜单项扁平化（单子菜单向上合并 title/icon）
 *   - 侧边菜单路径解析与激活判定
 *   - 菜单切换导航（自动跳转到第一个可访问子菜单）
 *   - 路由变化时同步顶部菜单激活态与侧边菜单数据
 *
 * 模板只绑定返回值，无需关心内部实现。
 */
import type { LocationQueryRaw, RouteRecordRaw } from "vue-router";
import { useLayout } from "../useLayout";
import { useAppStore, usePermissionStore, useSettingsStore } from "@/stores";
import { isExternal } from "@/utils/index";
import { ElIcon } from "element-plus";

/* ------------------------------------------------------------------ */
/*  MenuIcon — 菜单图标渲染组件（Element Plus / SVG 双模式）           */
/* ------------------------------------------------------------------ */

const MenuIcon = defineComponent({
  props: { icon: String },
  setup(props) {
    const isElIcon = computed(() => props.icon?.startsWith("el-icon"));
    const iconName = computed(() => props.icon?.replace("el-icon-", ""));

    return () => {
      if (!props.icon) {
        return h("div", { class: "i-svg:menu" });
      }

      if (isElIcon.value) {
        return h(ElIcon, null, () => h(resolveComponent(iconName.value!)));
      }

      return h("div", { class: `i-svg:${props.icon}` });
    };
  },
});

/* ------------------------------------------------------------------ */
/*  useMixMenu                                                         */
/* ------------------------------------------------------------------ */

export function useMixMenu() {
  const route = useRoute();
  const router = useRouter();

  const appStore = useAppStore();
  const permissionStore = usePermissionStore();
  const settingsStore = useSettingsStore();

  const { activeTopMenuPath, sideMenuRoutes } = useLayout();

  /* ------ 顶部菜单 ------------------------------------------------- */

  /**
   * 顶部菜单项。
   *
   * 过滤隐藏路由，并将仅有一个可见子菜单的父级菜单向上合并
   * —— 把子菜单的 title / icon 提升到父级，让顶栏直接显示为叶子节点。
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

  /* ------ 侧边菜单 ------------------------------------------------- */

  /** 当前路由对应的侧边菜单激活路径（优先取 meta.activeMenu） */
  const activeSideMenuPath = computed(() => {
    const { meta, path } = route;
    return typeof meta?.activeMenu === "string" ? meta.activeMenu : path;
  });

  /**
   * 将侧边菜单项的相对路径解析为完整路径。
   *
   *   - 外部链接原样返回
   *   - 以 "/" 开头：拼在顶部菜单路径之后
   *   - 否则：拼在当前顶部路径后
   */
  function resolvePath(routePath: string): string {
    if (isExternal(routePath)) return routePath;
    if (routePath.startsWith("/")) return activeTopMenuPath.value + routePath;
    return `${activeTopMenuPath.value}/${routePath}`;
  }

  /* ------ 路径工具 ------------------------------------------------- */

  /**
   * 从完整路径中提取第一段作为顶级菜单路径。
   *
   *   "/system/user" → "/system"
   *   "/dashboard"   → "/"
   */
  function extractTopMenuPath(path: string): string {
    return path.split("/").filter(Boolean).length > 1
      ? path.match(/^\/[^/]+/)?.[0] || "/"
      : "/";
  }

  /* ------ 菜单切换 ------------------------------------------------- */

  /** 顶部菜单点击：切换侧边菜单数据，并导航到第一个可访问叶子菜单 */
  function handleTopMenuSelect(menuPath: string) {
    if (menuPath === activeTopMenuPath.value) return;

    appStore.setActiveTopMenuPath(menuPath);
    permissionStore.setMixLayoutSideMenus(menuPath);
    navigateToFirstMenu(permissionStore.mixLayoutSideMenus);
  }

  /**
   * 递归查找并跳转到第一个可访问的叶子路由。
   *
   * 有子路由时继续深入，无子路由时按 name 跳转，
   * 同时携带 meta.params 作为 query 参数。
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

  /* ------ 路由同步 ------------------------------------------------- */

  /**
   * 监听路由变化，保持顶部菜单激活态和侧边菜单数据同步。
   *
   * 场景覆盖：
   *   1. 普通页面跳转 —— 自动切换顶部菜单
   *   2. 布局切换（如左侧→混合）—— 已缓存正确 activeTopMenuPath
   *      但 mixLayoutSideMenus 可能为空，需要补初始化
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
    MenuIcon,
    topMenuItems,
    activeSideMenuPath,
    activeTopMenuPath,
    sideMenuRoutes,
    resolvePath,
    handleTopMenuSelect,
  };
}
