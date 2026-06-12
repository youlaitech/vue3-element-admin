/**
 * 布局 Composable
 *
 * 整合布局状态、设备检测、菜单数据
 */
import { useRoute } from "vue-router";
import { useWindowSize } from "@vueuse/core";
import { useAppStore, usePermissionStore, useSettingsStore } from "@/stores";
import { DeviceEnum } from "@/enums/settings";
import { defaults } from "@/settings";

const DESKTOP_BREAKPOINT = 992;

export function useLayout() {
  const route = useRoute();
  const appStore = useAppStore();
  const settingsStore = useSettingsStore();
  const permissionStore = usePermissionStore();
  const { width } = useWindowSize();

  // ============================================
  // 设备检测
  // ============================================

  const isDesktop = computed(() => width.value >= DESKTOP_BREAKPOINT);
  const isMobile = computed(() => appStore.device === DeviceEnum.MOBILE);

  // 监听窗口变化，自动调整设备类型和侧边栏
  watchEffect(() => {
    const device = isDesktop.value ? DeviceEnum.DESKTOP : DeviceEnum.MOBILE;
    appStore.toggleDevice(device);

    if (isDesktop.value) {
      appStore.openSidebar();
    } else {
      appStore.closeSidebar();
    }
  });

  // ============================================
  // 布局状态
  // ============================================

  const currentLayout = computed(() => settingsStore.layout);
  const isSidebarOpen = computed(() => appStore.sidebar.opened);
  const showTagsView = computed(() => settingsStore.showTagsView);
  const showSettings = computed(() => defaults.showSettings);
  const showLogo = computed(() => settingsStore.showAppLogo);

  const layoutClass = computed(() => ({
    hideSidebar: !appStore.sidebar.opened,
    openSidebar: appStore.sidebar.opened,
    mobile: appStore.device === DeviceEnum.MOBILE,
    [`layout-${settingsStore.layout}`]: true,
  }));

  // ============================================
  // 菜单数据
  // ============================================

  /**
   * 路由列表。
   *
   * 左侧/顶部菜单共用，由权限 store 生成。
   */
  const routes = computed(() => permissionStore.routes);

  /**
   * 混合布局侧边菜单。
   *
   * 根据当前激活的顶部菜单路径动态计算。
   */
  const sideMenuRoutes = computed(() => permissionStore.mixLayoutSideMenus);

  /**
   * 顶部菜单激活路径。
   */
  const activeTopMenuPath = computed(() => appStore.activeTopMenuPath);

  /**
   * 当前激活菜单。
   *
   * 优先取路由 meta.activeMenu，否则取当前路径。
   */
  const activeMenu = computed(() => {
    const { meta, path } = route;
    return meta?.activeMenu || path;
  });

  // ============================================
  // 操作方法
  // ============================================

  function toggleSidebar() {
    appStore.toggleSidebar();
  }

  function closeSidebar() {
    appStore.closeSidebar();
  }

  return {
    // 设备
    isDesktop,
    isMobile,
    // 布局
    currentLayout,
    layoutClass,
    isSidebarOpen,
    showTagsView,
    showSettings,
    showLogo,
    // 菜单
    routes,
    sideMenuRoutes,
    activeMenu,
    activeTopMenuPath,
    // 方法
    toggleSidebar,
    closeSidebar,
  };
}
