import { defineStore } from "pinia";
import defaultSettings from "@/settings";

export const useSettingsStore = defineStore("setting", () => {
  const title = defaultSettings.title;
  const version = defaultSettings.version;

  const tagsView = useStorage<boolean>("tagsView", defaultSettings.tagsView);

  const showSettings = ref<boolean>(defaultSettings.showSettings);
  const sidebarLogo = ref<boolean>(defaultSettings.sidebarLogo);
  const fixedHeader = useStorage<boolean>(
    "fixedHeader",
    defaultSettings.fixedHeader
  );
  const layout = useStorage<string>("layout", defaultSettings.layout);
  const themeColor = useStorage<string>(
    "themeColor",
    defaultSettings.themeColor
  );
  const theme = useStorage<string>("theme", defaultSettings.theme);

  // Whether to enable watermark
  const watermark = useStorage<any>("watermark", defaultSettings.watermark);

  const settingsMap: Record<string, Ref<any>> = {
    showSettings,
    fixedHeader,
    tagsView,
    sidebarLogo,
    layout,
    themeColor,
    theme,
    watermark: watermark.value,
  };

  function changeSetting({ key, value }: { key: string; value: any }) {
    const setting = settingsMap[key];
    if (setting !== undefined) {
      setting.value = value;
      if (key === "theme" && value === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }

  return {
    title,
    version,
    showSettings,
    tagsView,
    fixedHeader,
    sidebarLogo,
    layout,
    themeColor,
    changeSetting,
    theme,
    watermark,
  };
});
