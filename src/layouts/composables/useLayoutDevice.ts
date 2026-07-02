import { useWindowSize } from "@vueuse/core";
import { useAppStore } from "@/stores";
import { DeviceEnum } from "@/enums/settings";

const WIDE_BREAKPOINT = 992;
const MOBILE_BREAKPOINT = 768;

/**
 * 根据窗口宽度同步设备类型和侧边栏展开状态
 *
 * 三档断点：
 * - ≥992px：桌面宽屏，侧边栏展开（完整菜单）
 * - 768~992px：桌面窄屏，侧边栏收缩（仅图标）
 * - <768px：移动端，侧边栏完全隐藏
 */
export function useLayoutDevice() {
  const appStore = useAppStore();
  const { width } = useWindowSize();

  const isDesktop = computed(() => width.value >= MOBILE_BREAKPOINT);
  const isWideDesktop = computed(() => width.value >= WIDE_BREAKPOINT);

  watchEffect(() => {
    const device = isDesktop.value ? DeviceEnum.DESKTOP : DeviceEnum.MOBILE;

    appStore.toggleDevice(device);

    if (isWideDesktop.value) {
      appStore.openSidebar();
    } else {
      appStore.closeSidebar();
    }
  });

  return {
    isDesktop,
  };
}
