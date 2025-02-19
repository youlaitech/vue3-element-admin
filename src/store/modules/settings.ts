import defaultSettings from "@/settings";
import { SidebarLightThemeEnum, ThemeEnum } from "@/enums/ThemeEnum";
import {
  generateThemeColors,
  applyTheme,
  toggleDarkMode,
  toggleLightModeSidebarColorScheme,
} from "@/utils/theme";

type SettingsValue = boolean | string;

export const useSettingsStore = defineStore("setting", () => {
  // 基本设置
  const settingsVisible = ref(false);
  // 标签
  const tagsView = useStorage<boolean>("tagsView", defaultSettings.tagsView);
  // 侧边栏 Logo
  const sidebarLogo = useStorage<boolean>("sidebarLogo", defaultSettings.sidebarLogo);
  // 浅色主题下的侧边栏配色方案 (白色/深蓝色)
  const sidebarColorScheme = useStorage<string>(
    "sidebarColorScheme",
    defaultSettings.sidebarColorScheme
  );
  // 布局
  const layout = useStorage<string>("layout", defaultSettings.layout);
  // 水印
  const watermarkEnabled = useStorage<boolean>(
    "watermarkEnabled",
    defaultSettings.watermarkEnabled
  );

  // 主题
  const themeColor = useStorage<string>("themeColor", defaultSettings.themeColor);
  const theme = useStorage<string>("theme", defaultSettings.theme);

  //  监听主题变化
  watch(
    [theme, themeColor],
    ([newTheme, newThemeColor]) => {
      toggleDarkMode(newTheme === ThemeEnum.DARK);
      const colors = generateThemeColors(newThemeColor);
      applyTheme(colors);
    },
    { immediate: true }
  );

  //  监听浅色侧边栏配色方案变化
  watch(
    [sidebarColorScheme],
    ([newSidebarColorScheme]) => {
      toggleLightModeSidebarColorScheme(newSidebarColorScheme === SidebarLightThemeEnum.DARKBLUE);
    },
    { immediate: true }
  );

  // 设置映射
  const settingsMap: Record<string, Ref<SettingsValue>> = {
    tagsView,
    sidebarLogo,
    sidebarColorScheme,
    layout,
    watermarkEnabled,
  };

  function changeSetting({ key, value }: { key: string; value: SettingsValue }) {
    const setting = settingsMap[key];
    if (setting) setting.value = value;
  }

  function changeTheme(val: string) {
    theme.value = val;
  }

  function changeSidebarColorScheme(val: string) {
    sidebarColorScheme.value = val;
  }

  function changeThemeColor(color: string) {
    themeColor.value = color;
  }

  function changeLayout(val: string) {
    layout.value = val;
  }

  return {
    settingsVisible,
    tagsView,
    sidebarLogo,
    sidebarColorScheme,
    layout,
    themeColor,
    theme,
    watermarkEnabled,
    changeSetting,
    changeTheme,
    changeThemeColor,
    changeLayout,
    changeSidebarColorScheme,
  };
});
