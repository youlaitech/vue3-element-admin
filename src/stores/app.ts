import zhCn from "element-plus/es/locale/lang/zh-cn";
import en from "element-plus/es/locale/lang/en";
import { store } from "@/stores";
import { DeviceEnum, SidebarStatus } from "@/enums";
import { STORAGE_KEYS } from "@/constants";
import { defaults } from "@/settings";

export const useAppStore = defineStore("app", () => {
  /**
   * 当前设备类型
   */
  const device = useStorage(STORAGE_KEYS.DEVICE, DeviceEnum.DESKTOP);

  /**
   * 组件默认尺寸
   */
  const size = useStorage(STORAGE_KEYS.SIZE, defaults.size);

  /**
   * 当前语言
   */
  const language = useStorage(STORAGE_KEYS.LANGUAGE, defaults.language);

  /**
   * 侧边栏持久化状态
   */
  const sidebarStatus = useStorage(STORAGE_KEYS.SIDEBAR_STATUS, SidebarStatus.CLOSED);

  /**
   * 侧边栏显示状态
   */
  const sidebar = reactive({
    opened: sidebarStatus.value === SidebarStatus.OPENED,
    withoutAnimation: false,
  });

  /**
   * 当前激活的顶部菜单路径
   */
  const activeTopMenuPath = useStorage(STORAGE_KEYS.ACTIVE_TOP_MENU_PATH, "");

  /**
   * 内容区是否全屏
   */
  const contentFullscreen = ref(false);

  /**
   * Element Plus 当前语言包
   */
  const locale = computed(() => (language?.value === "en" ? en : zhCn));

  /**
   * 切换侧边栏展开状态
   */
  function toggleSidebar() {
    sidebar.opened = !sidebar.opened;
    sidebarStatus.value = sidebar.opened ? SidebarStatus.OPENED : SidebarStatus.CLOSED;
  }

  /**
   * 关闭侧边栏
   */
  function closeSidebar() {
    sidebar.opened = false;
    sidebarStatus.value = SidebarStatus.CLOSED;
  }

  /**
   * 打开侧边栏
   */
  function openSidebar() {
    sidebar.opened = true;
    sidebarStatus.value = SidebarStatus.OPENED;
  }

  /**
   * 切换设备类型
   */
  function toggleDevice(val: string) {
    device.value = val;
  }

  /**
   * 切换组件尺寸
   */
  function changeSize(val: string) {
    size.value = val;
  }

  /**
   * 切换语言
   */
  function changeLanguage(val: string) {
    language.value = val;
  }

  /**
   * 设置顶部菜单激活路径
   */
  function setActiveTopMenuPath(path: string) {
    activeTopMenuPath.value = path;
  }

  /**
   * 切换内容区全屏状态
   */
  function toggleContentFullscreen() {
    contentFullscreen.value = !contentFullscreen.value;
  }

  return {
    device,
    sidebar,
    language,
    locale,
    size,
    contentFullscreen,
    toggleDevice,
    changeSize,
    changeLanguage,
    toggleSidebar,
    closeSidebar,
    openSidebar,
    setActiveTopMenuPath,
    toggleContentFullscreen,
    activeTopMenuPath,
  };
});

export function useAppStoreHook() {
  return useAppStore(store);
}
