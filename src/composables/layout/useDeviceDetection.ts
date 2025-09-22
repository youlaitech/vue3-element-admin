import { watchEffect, computed } from "vue";
import { useWindowSize } from "@vueuse/core";
import { useAppStore } from "@/store";
import { DeviceEnum } from "@/enums/settings/device-enum";

/**
 * 设备检测和响应式处理
 * 监听屏幕尺寸变化，自动调整设备类型和侧边栏状态
 */
export function useDeviceDetection() {
  const appStore = useAppStore();
  const { width } = useWindowSize();

  // 桌面设备断点
  const DESKTOP_BREAKPOINT = 992;

  // 计算设备类型
  const isDesktop = computed(() => width.value >= DESKTOP_BREAKPOINT);
  const isMobile = computed(() => appStore.device === DeviceEnum.MOBILE);

  // 监听屏幕尺寸变化，自动调整设备类型和侧边栏状态
  watchEffect(() => {
    const deviceType = isDesktop.value ? DeviceEnum.DESKTOP : DeviceEnum.MOBILE;

    // 更新设备类型
    appStore.toggleDevice(deviceType);

    // 根据设备类型调整侧边栏状态
    if (isDesktop.value) {
      appStore.openSideBar();
    } else {
      appStore.closeSideBar();
    }
  });

  return {
    isDesktop,
    isMobile,
  };
}
