import { defineStore } from 'pinia';
import defaultSettings from '../../settings';
import { ref } from 'vue';
import { useCssVar, useStorage } from '@vueuse/core';

const el = document.documentElement;

export const useSettingsStore = defineStore('setting', () => {
  // state
  const theme = useStorage('theme', useCssVar('--el-color-primary', el))

  const showSettings = ref<boolean>(defaultSettings.showSettings);
  const tagsView = useStorage<boolean>('tagsView', defaultSettings.tagsView)
  const fixedHeader = ref<boolean>(defaultSettings.fixedHeader);
  const sidebarLogo = ref<boolean>(defaultSettings.sidebarLogo);

  // actions
  function changeSetting(param: { key: string; value: any }) {
    const { key, value } = param;
    switch (key) {
      case 'theme':
        theme.value = value;
        break;
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
      default:
        break;
    }
  }

  return {
    theme,
    showSettings,
    tagsView,
    fixedHeader,
    sidebarLogo,
    changeSetting
  };
});
