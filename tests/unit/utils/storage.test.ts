import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Storage } from "@/utils/storage";
import { STORAGE_KEYS, APP_PREFIX } from "@/constants";

describe("Storage 工具类", () => {
  // 每个测试前清理存储
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  // 每个测试后清理存储
  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe("localStorage 操作", () => {
    it("应该能够存储和获取字符串", () => {
      Storage.set("test-key", "test-value");
      expect(Storage.get("test-key")).toBe("test-value");
    });

    it("应该能够存储和获取对象", () => {
      const testObj = { name: "张三", age: 25 };
      Storage.set("test-obj", testObj);
      expect(Storage.get("test-obj")).toEqual(testObj);
    });

    it("应该能够存储和获取数组", () => {
      const testArr = [1, 2, 3, 4, 5];
      Storage.set("test-arr", testArr);
      expect(Storage.get("test-arr")).toEqual(testArr);
    });

    it("应该能够存储和获取布尔值", () => {
      Storage.set("test-bool", true);
      expect(Storage.get("test-bool")).toBe(true);
    });

    it("获取不存在的键应该返回 undefined", () => {
      expect(Storage.get("non-existent")).toBeUndefined();
    });

    it("获取不存在的键应该返回默认值", () => {
      expect(Storage.get("non-existent", "default")).toBe("default");
    });

    it("应该能够删除存储项", () => {
      Storage.set("test-key", "test-value");
      Storage.remove("test-key");
      expect(Storage.get("test-key")).toBeUndefined();
    });
  });

  describe("sessionStorage 操作", () => {
    it("应该能够存储和获取字符串", () => {
      Storage.sessionSet("test-key", "test-value");
      expect(Storage.sessionGet("test-key")).toBe("test-value");
    });

    it("应该能够存储和获取对象", () => {
      const testObj = { name: "李四", age: 30 };
      Storage.sessionSet("test-obj", testObj);
      expect(Storage.sessionGet("test-obj")).toEqual(testObj);
    });

    it("获取不存在的键应该返回默认值", () => {
      expect(Storage.sessionGet("non-existent", "default")).toBe("default");
    });

    it("应该能够删除存储项", () => {
      Storage.sessionSet("test-key", "test-value");
      Storage.sessionRemove("test-key");
      expect(Storage.sessionGet("test-key")).toBeUndefined();
    });
  });

  describe("批量清理操作", () => {
    it("clear() 应该同时清理 localStorage 和 sessionStorage", () => {
      Storage.set("test-key", "local-value");
      Storage.sessionSet("test-key", "session-value");

      Storage.clear("test-key");

      expect(Storage.get("test-key")).toBeUndefined();
      expect(Storage.sessionGet("test-key")).toBeUndefined();
    });

    it("clearMultiple() 应该批量清理多个键", () => {
      Storage.set("key1", "value1");
      Storage.set("key2", "value2");
      Storage.sessionSet("key1", "session1");

      Storage.clearMultiple(["key1", "key2"]);

      expect(Storage.get("key1")).toBeUndefined();
      expect(Storage.get("key2")).toBeUndefined();
      expect(Storage.sessionGet("key1")).toBeUndefined();
    });

    it("clearByPrefix() 应该清理指定前缀的所有存储项", () => {
      Storage.set(`${APP_PREFIX}:auth:token`, "token123");
      Storage.set(`${APP_PREFIX}:auth:user`, "user123");
      Storage.set(`${APP_PREFIX}:ui:theme`, "dark");
      Storage.set("other:key", "other-value");

      Storage.clearByPrefix(`${APP_PREFIX}:auth:`);

      expect(Storage.get(`${APP_PREFIX}:auth:token`)).toBeUndefined();
      expect(Storage.get(`${APP_PREFIX}:auth:user`)).toBeUndefined();
      expect(Storage.get(`${APP_PREFIX}:ui:theme`)).toBe("dark");
      expect(Storage.get("other:key")).toBe("other-value");
    });

    it("clearAllProject() 应该清理所有项目相关的存储", () => {
      Storage.set(STORAGE_KEYS.ACCESS_TOKEN, "token123");
      Storage.set(STORAGE_KEYS.THEME, "dark");
      Storage.set("other:key", "other-value");

      Storage.clearAllProject();

      expect(Storage.get(STORAGE_KEYS.ACCESS_TOKEN)).toBeUndefined();
      expect(Storage.get(STORAGE_KEYS.THEME)).toBeUndefined();
      expect(Storage.get("other:key")).toBe("other-value");
    });
  });

  describe("边界情况", () => {
    it("应该能够处理 null 值", () => {
      Storage.set("test-null", null);
      expect(Storage.get("test-null")).toBeNull();
    });

    it("应该能够处理空字符串", () => {
      Storage.set("test-empty", "");
      expect(Storage.get("test-empty")).toBe("");
    });

    it("应该能够处理数字 0", () => {
      Storage.set("test-zero", 0);
      expect(Storage.get("test-zero")).toBe(0);
    });

    it("应该能够处理 false", () => {
      Storage.set("test-false", false);
      expect(Storage.get("test-false")).toBe(false);
    });
  });
});
