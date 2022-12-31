import { defineStore } from 'pinia';
import defaultSettings from '../../settings';
import { ref } from 'vue';
import { useStorage } from '@vueuse/core';

/**
 * 主题类型
 */
export enum ThemeType {
  light,
  dark
}

/**
 * 布局类型
 */
export enum LayoutType {
  left,
  top,
  mix
}

export const useSettingsStore = defineStore('setting', () => {
  // state
  const showSettings = ref<boolean>(defaultSettings.showSettings);
  const tagsView = useStorage<boolean>('tagsView', defaultSettings.tagsView);
  const fixedHeader = ref<boolean>(defaultSettings.fixedHeader);
  const sidebarLogo = ref<boolean>(defaultSettings.sidebarLogo);

  const layout = useStorage<string>('layout', defaultSettings.layout);

  // actions
  function changeSetting(param: { key: string; value: any }) {
    const { key, value } = param;
    switch (key) {
      case 'showSettings':
        showSettings.value = value;
        break;
      case 'fixedHeader':
        fixedHeader.value = value;
        break;
      case 'tagsView':
        tagsView.value = value;
        break;
      case 'sidevarLogo':
        sidebarLogo.value = value;
        break;
      case 'layout':
        layout.value = value;
        break;
      default:
        break;
    }
  }

  return {
    showSettings,
    tagsView,
    fixedHeader,
    sidebarLogo,
    layout,
    changeSetting
  };
});
