import { watchEffect, computed } from "vue";
import { useWindowSize } from "@vueuse/core";
import { useAppStore } from "@/store";
import { DeviceEnum } from "@/enums/settings/device.enum";

/**
 * 布局响应式处理逻辑
 */
export function useLayoutResponsive() {
  const appStore = useAppStore();
  const { width } = useWindowSize();

  // 定义响应式断点
  const WIDTH_DESKTOP = 992; // 桌面设备断点 (>=992px)

  // 设置当前设备类型并调整侧边栏状态
  watchEffect(() => {
    const isDesktop = width.value >= WIDTH_DESKTOP;
    const deviceType = isDesktop ? DeviceEnum.DESKTOP : DeviceEnum.MOBILE;

    // 更新设备类型
    appStore.toggleDevice(deviceType);

    // 根据设备类型调整侧边栏状态
    if (isDesktop) {
      appStore.openSideBar();
    } else {
      appStore.closeSideBar();
    }
  });

  return {
    isDesktop: computed(() => width.value >= WIDTH_DESKTOP),
    isMobile: computed(() => appStore.device === DeviceEnum.MOBILE),
  };
}
