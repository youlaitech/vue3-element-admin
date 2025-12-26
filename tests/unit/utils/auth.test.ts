import { describe, it, expect, beforeEach, vi } from "vitest";
import { AuthStorage, hasPerm } from "@/utils/auth";
import { Storage } from "@/utils/storage";
import { STORAGE_KEYS, ROLE_ROOT } from "@/constants";

// Mock Storage
vi.mock("@/utils/storage", () => ({
  Storage: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
    sessionGet: vi.fn(),
    sessionSet: vi.fn(),
    sessionRemove: vi.fn(),
  },
}));

// Mock useUserStoreHook
vi.mock("@/store/modules/user", () => ({
  useUserStoreHook: vi.fn(() => ({
    userInfo: {
      roles: ["admin"],
      perms: ["sys:user:create", "sys:user:update"],
    },
  })),
}));

describe("Auth 工具函数", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("AuthStorage", () => {
    describe("getAccessToken()", () => {
      it("记住我为 true 时应该从 localStorage 获取", () => {
        vi.mocked(Storage.get).mockReturnValueOnce(true); // rememberMe
        vi.mocked(Storage.get).mockReturnValueOnce("token123"); // accessToken

        const token = AuthStorage.getAccessToken();

        expect(Storage.get).toHaveBeenCalledWith(STORAGE_KEYS.REMEMBER_ME, false);
        expect(Storage.get).toHaveBeenCalledWith(STORAGE_KEYS.ACCESS_TOKEN, "");
        expect(token).toBe("token123");
      });

      it("记住我为 false 时应该从 sessionStorage 获取", () => {
        vi.mocked(Storage.get).mockReturnValueOnce(false); // rememberMe
        vi.mocked(Storage.sessionGet).mockReturnValueOnce("session-token");

        const token = AuthStorage.getAccessToken();

        expect(Storage.sessionGet).toHaveBeenCalledWith(STORAGE_KEYS.ACCESS_TOKEN, "");
        expect(token).toBe("session-token");
      });
    });

    describe("getRefreshToken()", () => {
      it("记住我为 true 时应该从 localStorage 获取", () => {
        vi.mocked(Storage.get).mockReturnValueOnce(true);
        vi.mocked(Storage.get).mockReturnValueOnce("refresh123");

        const token = AuthStorage.getRefreshToken();

        expect(token).toBe("refresh123");
      });

      it("记住我为 false 时应该从 sessionStorage 获取", () => {
        vi.mocked(Storage.get).mockReturnValueOnce(false);
        vi.mocked(Storage.sessionGet).mockReturnValueOnce("session-refresh");

        const token = AuthStorage.getRefreshToken();

        expect(token).toBe("session-refresh");
      });
    });

    describe("setTokens()", () => {
      it("记住我为 true 时应该存储到 localStorage", () => {
        AuthStorage.setTokens("access123", "refresh123", true);

        expect(Storage.set).toHaveBeenCalledWith(STORAGE_KEYS.REMEMBER_ME, true);
        expect(Storage.set).toHaveBeenCalledWith(STORAGE_KEYS.ACCESS_TOKEN, "access123");
        expect(Storage.set).toHaveBeenCalledWith(STORAGE_KEYS.REFRESH_TOKEN, "refresh123");
      });

      it("记住我为 false 时应该存储到 sessionStorage", () => {
        AuthStorage.setTokens("access123", "refresh123", false);

        expect(Storage.set).toHaveBeenCalledWith(STORAGE_KEYS.REMEMBER_ME, false);
        expect(Storage.sessionSet).toHaveBeenCalledWith(STORAGE_KEYS.ACCESS_TOKEN, "access123");
        expect(Storage.sessionSet).toHaveBeenCalledWith(STORAGE_KEYS.REFRESH_TOKEN, "refresh123");
        expect(Storage.remove).toHaveBeenCalledWith(STORAGE_KEYS.ACCESS_TOKEN);
        expect(Storage.remove).toHaveBeenCalledWith(STORAGE_KEYS.REFRESH_TOKEN);
      });
    });

    describe("clearAuth()", () => {
      it("应该清理所有认证信息", () => {
        AuthStorage.clearAuth();

        expect(Storage.remove).toHaveBeenCalledWith(STORAGE_KEYS.ACCESS_TOKEN);
        expect(Storage.remove).toHaveBeenCalledWith(STORAGE_KEYS.REFRESH_TOKEN);
        expect(Storage.sessionRemove).toHaveBeenCalledWith(STORAGE_KEYS.ACCESS_TOKEN);
        expect(Storage.sessionRemove).toHaveBeenCalledWith(STORAGE_KEYS.REFRESH_TOKEN);
      });
    });

    describe("getRememberMe()", () => {
      it("应该获取记住我状态", () => {
        vi.mocked(Storage.get).mockReturnValueOnce(true);

        const rememberMe = AuthStorage.getRememberMe();

        expect(Storage.get).toHaveBeenCalledWith(STORAGE_KEYS.REMEMBER_ME, false);
        expect(rememberMe).toBe(true);
      });
    });
  });

  describe("hasPerm()", () => {
    it("超级管理员应该拥有所有按钮权限", () => {
      const { useUserStoreHook } = await import("@/store/modules/user");
      vi.mocked(useUserStoreHook).mockReturnValueOnce({
        userInfo: {
          roles: [ROLE_ROOT],
          perms: [],
        },
      } as any);

      expect(hasPerm("any:permission", "button")).toBe(true);
    });

    it("应该验证单个按钮权限", () => {
      expect(hasPerm("sys:user:create", "button")).toBe(true);
      expect(hasPerm("sys:user:delete", "button")).toBe(false);
    });

    it("应该验证多个按钮权限（或关系）", () => {
      expect(hasPerm(["sys:user:create", "sys:user:delete"], "button")).toBe(true);
      expect(hasPerm(["sys:user:delete", "sys:user:export"], "button")).toBe(false);
    });

    it("应该验证角色权限", () => {
      expect(hasPerm("admin", "role")).toBe(true);
      expect(hasPerm("user", "role")).toBe(false);
    });

    it("用户信息不完整时应该返回 false", () => {
      const { useUserStoreHook } = await import("@/store/modules/user");
      vi.mocked(useUserStoreHook).mockReturnValueOnce({
        userInfo: {},
      } as any);

      expect(hasPerm("any:permission")).toBe(false);
    });
  });
});
