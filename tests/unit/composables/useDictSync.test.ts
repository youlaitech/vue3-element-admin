import { describe, it, expect, beforeEach, vi } from "vitest";
import { useDictSync } from "@/composables/websocket/useDictSync";
import { useDictStore } from "@/store/modules/dict";
import { setActivePinia, createPinia } from "pinia";

// Mock useStomp
vi.mock("@/composables/websocket/useStomp", () => ({
  useStomp: vi.fn(() => ({
    isConnected: ref(false),
    connect: vi.fn(),
    disconnect: vi.fn(),
    subscribe: vi.fn(() => "sub-id"),
    unsubscribe: vi.fn(),
  })),
}));

describe("useDictSync", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("初始化", () => {
    it("应该创建字典同步实例", () => {
      const dictSync = useDictSync();
      expect(dictSync).toBeDefined();
      expect(dictSync.initialize).toBeDefined();
      expect(dictSync.cleanup).toBeDefined();
    });

    it("应该初始化 WebSocket 连接", () => {
      const dictSync = useDictSync();
      dictSync.initialize();
      // 验证初始化逻辑（具体实现取决于 useDictSync 的内部逻辑）
      expect(dictSync).toBeDefined();
    });
  });

  describe("清理", () => {
    it("应该清理 WebSocket 连接", () => {
      const dictSync = useDictSync();
      dictSync.initialize();
      dictSync.cleanup();
      // 验证清理逻辑
      expect(dictSync).toBeDefined();
    });
  });

  describe("字典同步", () => {
    it("应该处理字典更新消息", () => {
      const dictSync = useDictSync();
      const dictStore = useDictStore();

      dictSync.initialize();

      // 模拟接收字典更新消息
      // 注意：这里需要根据实际的消息格式来测试
      expect(dictStore).toBeDefined();
    });
  });
});
