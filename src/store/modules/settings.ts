import defaultSettings from "@/settings";
import { ThemeEnum } from "@/enums/ThemeEnum";
import Color from "color";

type SettingsValue = boolean | string;

export const useSettingsStore = defineStore("setting", () => {
  // 是否显示设置
  const settingsVisible = ref(false);
  // 是否显示标签视图
  const tagsView = useStorage<boolean>("tagsView", defaultSettings.tagsView);
  // 是否显示侧边栏logo
  const sidebarLogo = useStorage<boolean>(
    "sidebarLogo",
    defaultSettings.sidebarLogo
  );
  // 是否固定头部
  const fixedHeader = useStorage<boolean>(
    "fixedHeader",
    defaultSettings.fixedHeader
  );
  // 布局模式：left-左侧模式(默认) top-顶部模式 mix-混合模式
  const layout = useStorage<string>("layout", defaultSettings.layout);
  // 主题颜色
  const themeColor = useStorage<string>(
    "themeColor",
    defaultSettings.themeColor
  );
  // 主题：light-亮色(默认) dark-暗色
  const theme = useStorage<string>("theme", defaultSettings.theme);
  // 是否开启水印
  const watermarkEnabled = useStorage<boolean>(
    "watermarkEnabled",
    defaultSettings.watermarkEnabled
  );

  watch(
    [theme, themeColor],
    ([newTheme, newThemeColor], [oldTheme, oldThemeColor]) => {
      if (newTheme !== oldTheme) {
        if (newTheme === ThemeEnum.DARK) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }

      if (newThemeColor !== oldThemeColor) {
        const rootStyle = document.documentElement.style;
        rootStyle.setProperty(`--el-color-primary`, newThemeColor);
        rootStyle.setProperty(`--el-color-primary-dark-2`, newThemeColor);

        for (let i = 1; i < 10; i++) {
          rootStyle.setProperty(
            `--el-color-primary-light-${i}`,
            `${Color(newThemeColor).alpha(1 - i * 0.1)}`
          );
        }
      }
    },
    {
      immediate: true, // 立即执行，确保在侦听器创建时执行一次
    }
  );

  const settingsMap: Record<string, Ref<SettingsValue>> = {
    fixedHeader,
    tagsView,
    sidebarLogo,
    layout,
    watermarkEnabled,
  };

  function changeSetting({
    key,
    value,
  }: {
    key: string;
    value: SettingsValue;
  }) {
    const setting = settingsMap[key];
    if (setting) {
      setting.value = value;
    }
  }

  /**
   * 切换主题
   */
  function changeTheme(val: string) {
    theme.value = val;
  }

  /**
   * 切换主题颜色
   *
   * @param color 主题颜色
   *
   */
  function changeThemeColor(color: string) {
    themeColor.value = color;
  }

  /**
   * 切换布局
   */
  function changeLayout(val: string) {
    layout.value = val;
  }

  return {
    settingsVisible,
    tagsView,
    fixedHeader,
    sidebarLogo,
    layout,
    themeColor,
    theme,
    watermarkEnabled,
    changeSetting,
    changeTheme,
    changeThemeColor,
    changeLayout,
  };
});
