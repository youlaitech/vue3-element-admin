import { useWindowSize } from "@vueuse/core";
import { useAppStore } from "@/stores";
import { DeviceEnum } from "@/enums/settings";

const WIDE_BREAKPOINT = 992;
const MOBILE_BREAKPOINT = 768;

/**
 * 按窗口宽度同步设备类型和侧栏展开状态。
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
