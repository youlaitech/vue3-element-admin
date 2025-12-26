import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useDictStore } from "@/store/modules/dict";
import DictAPI from "@/api/system/dict";
import type { DictItemOption } from "@/types/api";

// Mock DictAPI
vi.mock("@/api/system/dict", () => ({
  default: {
    getDictItems: vi.fn(),
  },
}));

describe("useDictStore", () => {
  beforeEach(() => {
    // 创建新的 Pinia 实例
    setActivePinia(createPinia());
    // 清理 localStorage
    localStorage.clear();
    // 重置所有 mock
    vi.clearAllMocks();
  });

  describe("字典缓存", () => {
    it("应该缓存字典数据", async () => {
      const store = useDictStore();
      const mockData: DictItemOption[] = [
        { value: "1", label: "选项1" },
        { value: "2", label: "选项2" },
      ];

      vi.mocked(DictAPI.getDictItems).mockResolvedValue(mockData);

      await store.loadDictItems("test_dict");

      expect(store.getDictItems("test_dict")).toEqual(mockData);
      expect(DictAPI.getDictItems).toHaveBeenCalledWith("test_dict");
      expect(DictAPI.getDictItems).toHaveBeenCalledTimes(1);
    });

    it("应该从缓存中获取字典数据，不重复请求", async () => {
      const store = useDictStore();
      const mockData: DictItemOption[] = [{ value: "1", label: "选项1" }];

      vi.mocked(DictAPI.getDictItems).mockResolvedValue(mockData);

      // 第一次加载
      await store.loadDictItems("test_dict");
      // 第二次加载（应该从缓存获取）
      await store.loadDictItems("test_dict");

      expect(DictAPI.getDictItems).toHaveBeenCalledTimes(1);
      expect(store.getDictItems("test_dict")).toEqual(mockData);
    });

    it("应该防止并发重复请求", async () => {
      const store = useDictStore();
      const mockData: DictItemOption[] = [{ value: "1", label: "选项1" }];

      vi.mocked(DictAPI.getDictItems).mockResolvedValue(mockData);

      // 同时发起多个请求
      const promises = [
        store.loadDictItems("test_dict"),
        store.loadDictItems("test_dict"),
        store.loadDictItems("test_dict"),
      ];

      await Promise.all(promises);

      // 应该只请求一次
      expect(DictAPI.getDictItems).toHaveBeenCalledTimes(1);
    });
  });

  describe("字典操作", () => {
    it("应该返回空数组当字典不存在时", () => {
      const store = useDictStore();
      expect(store.getDictItems("non_exist")).toEqual([]);
    });

    it("应该移除指定字典项", async () => {
      const store = useDictStore();
      const mockData: DictItemOption[] = [{ value: "1", label: "选项1" }];

      vi.mocked(DictAPI.getDictItems).mockResolvedValue(mockData);

      await store.loadDictItems("test_dict");
      expect(store.getDictItems("test_dict")).toEqual(mockData);

      store.removeDictItem("test_dict");
      expect(store.getDictItems("test_dict")).toEqual([]);
    });

    it("应该清空所有字典缓存", async () => {
      const store = useDictStore();
      const mockData1: DictItemOption[] = [{ value: "1", label: "选项1" }];
      const mockData2: DictItemOption[] = [{ value: "2", label: "选项2" }];

      vi.mocked(DictAPI.getDictItems)
        .mockResolvedValueOnce(mockData1)
        .mockResolvedValueOnce(mockData2);

      await store.loadDictItems("dict1");
      await store.loadDictItems("dict2");

      expect(store.getDictItems("dict1")).toEqual(mockData1);
      expect(store.getDictItems("dict2")).toEqual(mockData2);

      store.clearDictCache();

      expect(store.getDictItems("dict1")).toEqual([]);
      expect(store.getDictItems("dict2")).toEqual([]);
    });
  });

  describe("错误处理", () => {
    it("应该处理请求失败的情况", async () => {
      const store = useDictStore();
      const error = new Error("Network error");

      vi.mocked(DictAPI.getDictItems).mockRejectedValue(error);

      await expect(store.loadDictItems("test_dict")).rejects.toThrow("Network error");

      // 失败后应该允许重试
      const mockData: DictItemOption[] = [{ value: "1", label: "选项1" }];
      vi.mocked(DictAPI.getDictItems).mockResolvedValue(mockData);

      await store.loadDictItems("test_dict");
      expect(store.getDictItems("test_dict")).toEqual(mockData);
    });
  });
});
