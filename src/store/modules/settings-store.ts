import { defaultSettings } from "@/settings";
import { SidebarColor, ThemeMode } from "@/enums/settings/theme.enum";
import type { LayoutMode } from "@/enums/settings/layout.enum";
import { applyTheme, generateThemeColors, toggleDarkMode, toggleSidebarColor } from "@/utils/theme";
import { SETTINGS_KEYS } from "@/constants";

// 🎯 设置项类型定义
interface SettingsState {
  // 界面显示设置
  settingsVisible: boolean;
  showTagsView: boolean;
  showAppLogo: boolean;
  showWatermark: boolean;

  // 布局设置
  layout: LayoutMode;
  sidebarColorScheme: string;

  // 主题设置
  theme: ThemeMode;
  themeColor: string;
}

// 🎯 可变更的设置项类型
type MutableSetting = Exclude<keyof SettingsState, "settingsVisible">;
type SettingValue<K extends MutableSetting> = SettingsState[K];

export const useSettingsStore = defineStore("setting", () => {
  // 🎯 基础设置 - 非持久化
  const settingsVisible = ref<boolean>(false);

  // 🎯 持久化设置 - 使用分组常量
  const showTagsView = useStorage<boolean>(
    SETTINGS_KEYS.SHOW_TAGS_VIEW,
    defaultSettings.showTagsView
  );

  const showAppLogo = useStorage<boolean>(SETTINGS_KEYS.SHOW_APP_LOGO, defaultSettings.showAppLogo);

  const showWatermark = useStorage<boolean>(
    SETTINGS_KEYS.SHOW_WATERMARK,
    defaultSettings.showWatermark
  );

  const sidebarColorScheme = useStorage<string>(
    SETTINGS_KEYS.SIDEBAR_COLOR_SCHEME,
    defaultSettings.sidebarColorScheme
  );

  const layout = useStorage<LayoutMode>(SETTINGS_KEYS.LAYOUT, defaultSettings.layout as LayoutMode);

  const themeColor = useStorage<string>(SETTINGS_KEYS.THEME_COLOR, defaultSettings.themeColor);

  const theme = useStorage<ThemeMode>(SETTINGS_KEYS.THEME, defaultSettings.theme);

  // 🎯 设置项映射
  const settingsMap = {
    showTagsView,
    showAppLogo,
    showWatermark,
    sidebarColorScheme,
    layout,
  } as const;

  // 🎯 监听器 - 主题变化
  watch(
    [theme, themeColor],
    ([newTheme, newThemeColor]) => {
      toggleDarkMode(newTheme === ThemeMode.DARK);
      const colors = generateThemeColors(newThemeColor, newTheme);
      applyTheme(colors);
    },
    { immediate: true }
  );

  // 🎯 监听器 - 侧边栏配色方案变化
  watch(
    [sidebarColorScheme],
    ([newSidebarColorScheme]) => {
      toggleSidebarColor(newSidebarColorScheme === SidebarColor.CLASSIC_BLUE);
    },
    { immediate: true }
  );

  // 🎯 统一的设置更新方法 - 类型安全
  function updateSetting<K extends keyof typeof settingsMap>(key: K, value: SettingValue<K>): void {
    const setting = settingsMap[key];
    if (setting) {
      (setting as Ref<any>).value = value;
    }
  }

  // 🎯 主题相关的专用更新方法
  function updateTheme(newTheme: ThemeMode): void {
    theme.value = newTheme;
  }

  function updateThemeColor(newColor: string): void {
    themeColor.value = newColor;
  }

  function updateSidebarColorScheme(newScheme: string): void {
    sidebarColorScheme.value = newScheme;
  }

  function updateLayout(newLayout: LayoutMode): void {
    layout.value = newLayout;
  }

  // 🎯 设置面板显示控制
  function toggleSettingsPanel(): void {
    settingsVisible.value = !settingsVisible.value;
  }

  function showSettingsPanel(): void {
    settingsVisible.value = true;
  }

  function hideSettingsPanel(): void {
    settingsVisible.value = false;
  }

  // 🎯 批量重置设置
  function resetSettings(): void {
    showTagsView.value = defaultSettings.showTagsView;
    showAppLogo.value = defaultSettings.showAppLogo;
    showWatermark.value = defaultSettings.showWatermark;
    sidebarColorScheme.value = defaultSettings.sidebarColorScheme;
    layout.value = defaultSettings.layout as LayoutMode;
    themeColor.value = defaultSettings.themeColor;
    theme.value = defaultSettings.theme;
  }

  return {
    // 状态
    settingsVisible,
    showTagsView,
    showAppLogo,
    showWatermark,
    sidebarColorScheme,
    layout,
    themeColor,
    theme,

    // 更新方法
    updateSetting,
    updateTheme,
    updateThemeColor,
    updateSidebarColorScheme,
    updateLayout,

    // 面板控制
    toggleSettingsPanel,
    showSettingsPanel,
    hideSettingsPanel,

    // 重置功能
    resetSettings,
  };
});
