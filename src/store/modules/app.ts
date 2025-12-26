import zhCn from "element-plus/es/locale/lang/zh-cn";
import en from "element-plus/es/locale/lang/en";
import { store } from "@/store";
import { DeviceEnum, SidebarStatus } from "@/enums";
import { STORAGE_KEYS } from "@/constants";
import { defaults } from "@/settings";

export const useAppStore = defineStore("app", () => {
  const device = useStorage(STORAGE_KEYS.DEVICE, DeviceEnum.DESKTOP);
  const size = useStorage(STORAGE_KEYS.SIZE, defaults.size);
  const language = useStorage(STORAGE_KEYS.LANGUAGE, defaults.language);
  const sidebarStatus = useStorage(STORAGE_KEYS.SIDEBAR_STATUS, SidebarStatus.CLOSED);
  const sidebar = reactive({
    opened: sidebarStatus.value === SidebarStatus.OPENED,
    withoutAnimation: false,
  });
  const activeTopMenuPath = useStorage(STORAGE_KEYS.ACTIVE_TOP_MENU_PATH, "");

  const locale = computed(() => (language?.value === "en" ? en : zhCn));

  function toggleSidebar() {
    sidebar.opened = !sidebar.opened;
    sidebarStatus.value = sidebar.opened ? SidebarStatus.OPENED : SidebarStatus.CLOSED;
  }

  function closeSideBar() {
    sidebar.opened = false;
    sidebarStatus.value = SidebarStatus.CLOSED;
  }

  function openSideBar() {
    sidebar.opened = true;
    sidebarStatus.value = SidebarStatus.OPENED;
  }

  function toggleDevice(val: string) {
    device.value = val;
  }

  function changeSize(val: string) {
    size.value = val;
  }

  function changeLanguage(val: string) {
    language.value = val;
  }

  function activeTopMenu(val: string) {
    activeTopMenuPath.value = val;
  }

  return {
    device,
    sidebar,
    language,
    locale,
    size,
    activeTopMenu,
    toggleDevice,
    changeSize,
    changeLanguage,
    toggleSidebar,
    closeSideBar,
    openSideBar,
    activeTopMenuPath,
  };
});

export function useAppStoreHook() {
  return useAppStore(store);
}
