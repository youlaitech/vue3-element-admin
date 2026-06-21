import { useRoute } from "vue-router";
import { useAppStore, usePermissionStore, useSettingsStore } from "@/stores";
import { DeviceEnum } from "@/enums/settings";
import { defaults } from "@/settings";

/**
 * 提供布局组件共用的响应式状态
 */
export function useLayout() {
  const route = useRoute();
  const appStore = useAppStore();
  const settingsStore = useSettingsStore();
  const permissionStore = usePermissionStore();

  const isMobile = computed(() => appStore.device === DeviceEnum.MOBILE);
  const currentLayout = computed(() => settingsStore.layout);
  const isSidebarOpen = computed(() => appStore.sidebar.opened);
  const showTagsView = computed(() => settingsStore.showTagsView);
  const showSettings = computed(() => defaults.showSettings);
  const showLogo = computed(() => settingsStore.showAppLogo);

  const layoutClass = computed(() => ({
    "is-sidebar-collapsed": !appStore.sidebar.opened,
    "is-sidebar-open": appStore.sidebar.opened,
    "is-mobile": appStore.device === DeviceEnum.MOBILE,
    [`layout--${settingsStore.layout}`]: true,
  }));

  /**
   * 左侧和顶部菜单共用的路由列表
   */
  const routes = computed(() => permissionStore.routes);

  /**
   * 混合布局中随顶部菜单切换的侧边菜单
   */
  const sideMenuRoutes = computed(() => permissionStore.mixLayoutSideMenus);

  /**
   * 混合布局当前激活的顶部菜单路径
   */
  const activeTopMenuPath = computed(() => appStore.activeTopMenuPath);

  /**
   * 当前侧边菜单激活路径
   */
  const activeMenu = computed(() => {
    const { meta, path } = route;
    return meta?.activeMenu || path;
  });

  function toggleSidebar() {
    appStore.toggleSidebar();
  }

  function closeSidebar() {
    appStore.closeSidebar();
  }

  return {
    isMobile,
    currentLayout,
    layoutClass,
    isSidebarOpen,
    showTagsView,
    showSettings,
    showLogo,
    routes,
    sideMenuRoutes,
    activeMenu,
    activeTopMenuPath,
    toggleSidebar,
    closeSidebar,
  };
}
