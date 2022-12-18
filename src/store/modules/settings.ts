import { defineStore } from 'pinia';
import defaultSettings from '../../settings';
import { localStorage } from '@/utils/localStorage';
import { ref } from 'vue';

const el = document.documentElement;

export const useSettingsStore = defineStore('setting', () => {
  // state
  const theme = ref(
    localStorage.get('theme') ||
      getComputedStyle(el).getPropertyValue(`--el-color-primary`)
  );

  const showSettings = ref<boolean>(defaultSettings.showSettings);
  const tagsView = ref<boolean>(
    localStorage.get('tagsView') || defaultSettings.tagsView
  );
  const fixedHeader = ref<boolean>(defaultSettings.fixedHeader);
  const sidebarLogo = ref<boolean>(defaultSettings.sidebarLogo);

  // auction
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
        localStorage.set('tagsView', value);
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
