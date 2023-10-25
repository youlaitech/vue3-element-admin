import { defineStore } from "pinia";
import defaultSettings from "@/settings";

export const useSettingsStore = defineStore("setting", () => {
  // state
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
  if (theme.value == "light") {
    document.body.classList.remove("dark");
  }
  // actions
  function changeSetting(param: { key: string; value: any }) {
    const { key, value } = param;
    switch (key) {
      case "showSettings":
        showSettings.value = value;
        break;
      case "fixedHeader":
        fixedHeader.value = value;
        break;
      case "tagsView":
        tagsView.value = value;
        break;
      case "sidevarLogo":
        sidebarLogo.value = value;
        break;
      case "layout":
        layout.value = value;
        break;
      case "themeColor":
        themeColor.value = value;
        break;
    }
  }

  return {
    showSettings,
    tagsView,
    fixedHeader,
    sidebarLogo,
    layout,
    themeColor,
    changeSetting,
  };
});
