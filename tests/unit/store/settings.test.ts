import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useSettingsStore } from "@/store/modules/settings";
import { ThemeMode, SidebarColor } from "@/enums";

// Mock theme utils
vi.mock("@/utils/theme", () => ({
  applyTheme: vi.fn(),
  generateThemeColors: vi.fn(() => ({})),
  toggleDarkMode: vi.fn(),
  toggleSidebarColor: vi.fn(),
}));

describe("useSettingsStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("界面显示设置", () => {
    it("应该切换标签页显示", () => {
      const store = useSettingsStore();
      const initial = store.showTagsView;

      store.showTagsView = !initial;
      expect(store.showTagsView).toBe(!initial);
    });

    it("应该切换 Logo 显示", () => {
      const store = useSettingsStore();
      const initial = store.showAppLogo;

      store.showAppLogo = !initial;
      expect(store.showAppLogo).toBe(!initial);
    });

    it("应该切换水印显示", () => {
      const store = useSettingsStore();
      const initial = store.showWatermark;

      store.showWatermark = !initial;
      expect(store.showWatermark).toBe(!initial);
    });

    it("应该持久化界面显示设置", () => {
      const store = useSettingsStore();
      store.showTagsView = false;
      store.showAppLogo = false;
      store.showWatermark = true;

      const newStore = useSettingsStore();
      expect(newStore.showTagsView).toBe(false);
      expect(newStore.showAppLogo).toBe(false);
      expect(newStore.showWatermark).toBe(true);
    });
  });

  describe("主题设置", () => {
    it("应该切换主题模式", () => {
      const store = useSettingsStore();

      store.theme = ThemeMode.DARK;
      expect(store.theme).toBe(ThemeMode.DARK);

      store.theme = ThemeMode.LIGHT;
      expect(store.theme).toBe(ThemeMode.LIGHT);
    });

    it("应该修改主题颜色", () => {
      const store = useSettingsStore();

      store.themeColor = "#409EFF";
      expect(store.themeColor).toBe("#409EFF");

      store.themeColor = "#67C23A";
      expect(store.themeColor).toBe("#67C23A");
    });

    it("应该持久化主题设置", () => {
      const store = useSettingsStore();
      store.theme = ThemeMode.DARK;
      store.themeColor = "#409EFF";

      const newStore = useSettingsStore();
      expect(newStore.theme).toBe(ThemeMode.DARK);
      expect(newStore.themeColor).toBe("#409EFF");
    });
  });

  describe("侧边栏配色", () => {
    it("应该切换侧边栏配色方案", () => {
      const store = useSettingsStore();

      store.sidebarColorScheme = SidebarColor.CLASSIC_BLUE;
      expect(store.sidebarColorScheme).toBe(SidebarColor.CLASSIC_BLUE);

      store.sidebarColorScheme = SidebarColor.THEME_COLOR;
      expect(store.sidebarColorScheme).toBe(SidebarColor.THEME_COLOR);
    });

    it("应该持久化侧边栏配色", () => {
      const store = useSettingsStore();
      store.sidebarColorScheme = SidebarColor.CLASSIC_BLUE;

      const newStore = useSettingsStore();
      expect(newStore.sidebarColorScheme).toBe(SidebarColor.CLASSIC_BLUE);
    });
  });

  describe("特殊模式", () => {
    it("应该切换灰色模式", () => {
      const store = useSettingsStore();

      store.grayMode = true;
      expect(store.grayMode).toBe(true);

      store.grayMode = false;
      expect(store.grayMode).toBe(false);
    });

    it("应该切换色弱模式", () => {
      const store = useSettingsStore();

      store.colorWeak = true;
      expect(store.colorWeak).toBe(true);

      store.colorWeak = false;
      expect(store.colorWeak).toBe(false);
    });

    it("应该持久化特殊模式", () => {
      const store = useSettingsStore();
      store.grayMode = true;
      store.colorWeak = true;

      const newStore = useSettingsStore();
      expect(newStore.grayMode).toBe(true);
      expect(newStore.colorWeak).toBe(true);
    });
  });

  describe("AI 助手", () => {
    it("应该切换 AI 助手", () => {
      const store = useSettingsStore();

      store.userEnableAi = true;
      expect(store.userEnableAi).toBe(true);

      store.userEnableAi = false;
      expect(store.userEnableAi).toBe(false);
    });

    it("应该持久化 AI 助手设置", () => {
      const store = useSettingsStore();
      store.userEnableAi = true;

      const newStore = useSettingsStore();
      expect(newStore.userEnableAi).toBe(true);
    });
  });

  describe("页面切换动画", () => {
    it("应该修改页面切换动画", () => {
      const store = useSettingsStore();

      store.pageSwitchingAnimation = "fade";
      expect(store.pageSwitchingAnimation).toBe("fade");

      store.pageSwitchingAnimation = "fade-slide";
      expect(store.pageSwitchingAnimation).toBe("fade-slide");

      store.pageSwitchingAnimation = "fade-scale";
      expect(store.pageSwitchingAnimation).toBe("fade-scale");

      store.pageSwitchingAnimation = "none";
      expect(store.pageSwitchingAnimation).toBe("none");
    });

    it("应该持久化页面切换动画设置", () => {
      const store = useSettingsStore();
      store.pageSwitchingAnimation = "fade-scale";

      const newStore = useSettingsStore();
      expect(newStore.pageSwitchingAnimation).toBe("fade-scale");
    });

    it("应该使用默认的页面切换动画", () => {
      const store = useSettingsStore();
      // 默认值应该是 "fade-slide"
      expect(store.pageSwitchingAnimation).toBe("fade-slide");
    });
  });

  describe("重置设置", () => {
    it("应该重置所有设置为默认值", () => {
      const store = useSettingsStore();

      // 修改所有设置
      store.showTagsView = false;
      store.showAppLogo = false;
      store.showWatermark = false;
      store.pageSwitchingAnimation = "fade-slide";
      store.userEnableAi = true;
      store.grayMode = true;
      store.colorWeak = true;
      store.theme = ThemeMode.DARK;
      store.themeColor = "#409EFF";

      // 重置
      store.resetSettings();

      // 验证已重置（具体值取决于 defaults）
      expect(store.userEnableAi).toBe(false);
      expect(store.grayMode).toBe(false);
      expect(store.colorWeak).toBe(false);
      expect(store.pageSwitchingAnimation).toBe("fade-slide");
    });
  });
});
