import {
  getSidebarStatus,
  setSidebarStatus,
  getSize,
  setSize,
  setLanguage
} from '@/utils/localStorage';
import { defineStore } from 'pinia';
import { getLanguage } from '@/lang/index';
import { computed, reactive, ref } from 'vue';
import { useStorage } from '@vueuse/core';

// Element Plus 语言包
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import en from 'element-plus/es/locale/lang/en';

export enum DeviceType {
  mobile,
  desktop
}

export enum SizeType {
  default,
  large,
  small
}

// setup
export const useAppStore = defineStore('app', () => {
  // state
  const device = useStorage<string>('device', 'desktop');
  const size = ref(getSize() || 'default');
  const language = ref(getLanguage());
  const sidebar = reactive({
    opened: getSidebarStatus() !== 'closed',
    withoutAnimation: false
  });

  const locale = computed(() => {
    if (language?.value == 'en') {
      return en;
    } else {
      return zhCn;
    }
  });

  // actions
  function toggleSidebar(withoutAnimation: boolean) {
    sidebar.opened = !sidebar.opened;
    sidebar.withoutAnimation = withoutAnimation;
    if (sidebar.opened) {
      setSidebarStatus('opened');
    } else {
      setSidebarStatus('closed');
    }
  }

  function closeSideBar(withoutAnimation: boolean) {
    sidebar.opened = false;
    sidebar.withoutAnimation = withoutAnimation;
    setSidebarStatus('closed');
  }

  function openSideBar(withoutAnimation: boolean) {
    sidebar.opened = true;
    sidebar.withoutAnimation = withoutAnimation;
    setSidebarStatus('opened');
  }

  function toggleDevice(val: string) {
    device.value = val;
  }

  function changeSize(val: string) {
    size.value = val;
    setSize(val);
  }

  function changeLanguage(val: string) {
    language.value = val;
    setLanguage(val);
  }

  return {
    device,
    sidebar,
    language,
    locale,
    size,
    toggleDevice,
    changeSize,
    changeLanguage,
    toggleSidebar,
    closeSideBar,
    openSideBar
  };
});
