import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAppStore } from "@/store/modules/app";
import { DeviceEnum, SidebarStatus } from "@/enums";

describe("useAppStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  describe("侧边栏状态", () => {
    it("应该切换侧边栏状态", () => {
      const store = useAppStore();
      const initialState = store.sidebar.opened;

      store.toggleSidebar();
      expect(store.sidebar.opened).toBe(!initialState);

      store.toggleSidebar();
      expect(store.sidebar.opened).toBe(initialState);
    });

    it("应该关闭侧边栏", () => {
      const store = useAppStore();
      store.openSideBar();
      expect(store.sidebar.opened).toBe(true);

      store.closeSideBar();
      expect(store.sidebar.opened).toBe(false);
    });

    it("应该打开侧边栏", () => {
      const store = useAppStore();
      store.closeSideBar();
      expect(store.sidebar.opened).toBe(false);

      store.openSideBar();
      expect(store.sidebar.opened).toBe(true);
    });

    it("应该持久化侧边栏状态", () => {
      const store = useAppStore();
      store.openSideBar();

      // 创建新的 store 实例模拟页面刷新
      const newStore = useAppStore();
      expect(newStore.sidebar.opened).toBe(true);
    });
  });

  describe("设备类型", () => {
    it("应该切换设备类型", () => {
      const store = useAppStore();

      store.toggleDevice(DeviceEnum.MOBILE);
      expect(store.device).toBe(DeviceEnum.MOBILE);

      store.toggleDevice(DeviceEnum.DESKTOP);
      expect(store.device).toBe(DeviceEnum.DESKTOP);
    });

    it("应该持久化设备类型", () => {
      const store = useAppStore();
      store.toggleDevice(DeviceEnum.MOBILE);

      const newStore = useAppStore();
      expect(newStore.device).toBe(DeviceEnum.MOBILE);
    });
  });

  describe("组件尺寸", () => {
    it("应该修改组件尺寸", () => {
      const store = useAppStore();

      store.changeSize("large");
      expect(store.size).toBe("large");

      store.changeSize("small");
      expect(store.size).toBe("small");
    });

    it("应该持久化组件尺寸", () => {
      const store = useAppStore();
      store.changeSize("large");

      const newStore = useAppStore();
      expect(newStore.size).toBe("large");
    });
  });

  describe("语言设置", () => {
    it("应该修改语言", () => {
      const store = useAppStore();

      store.changeLanguage("en");
      expect(store.language).toBe("en");

      store.changeLanguage("zh-cn");
      expect(store.language).toBe("zh-cn");
    });

    it("应该根据语言返回正确的 locale", () => {
      const store = useAppStore();

      store.changeLanguage("en");
      expect(store.locale).toBeDefined();

      store.changeLanguage("zh-cn");
      expect(store.locale).toBeDefined();
    });

    it("应该持久化语言设置", () => {
      const store = useAppStore();
      store.changeLanguage("en");

      const newStore = useAppStore();
      expect(newStore.language).toBe("en");
    });
  });

  describe("顶部菜单", () => {
    it("应该激活顶部菜单", () => {
      const store = useAppStore();

      store.activeTopMenu("/dashboard");
      expect(store.activeTopMenuPath).toBe("/dashboard");

      store.activeTopMenu("/system");
      expect(store.activeTopMenuPath).toBe("/system");
    });

    it("应该持久化顶部菜单路径", () => {
      const store = useAppStore();
      store.activeTopMenu("/dashboard");

      const newStore = useAppStore();
      expect(newStore.activeTopMenuPath).toBe("/dashboard");
    });
  });
});
