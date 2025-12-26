import { describe, it, expect } from "vitest";
import { isExternal, isValidURL, isEmail, isMobile, VALIDATORS } from "@/utils/validate";

describe("Validate 工具函数", () => {
  describe("isExternal()", () => {
    it("应该识别外部链接", () => {
      expect(isExternal("https://www.example.com")).toBe(true);
      expect(isExternal("http://example.com")).toBe(true);
      expect(isExternal("//example.com")).toBe(true);
      expect(isExternal("mailto:test@example.com")).toBe(true);
      expect(isExternal("tel:1234567890")).toBe(true);
    });

    it("应该识别内部链接", () => {
      expect(isExternal("/dashboard")).toBe(false);
      expect(isExternal("dashboard")).toBe(false);
      expect(isExternal("./dashboard")).toBe(false);
      expect(isExternal("../dashboard")).toBe(false);
    });

    it("应该处理空字符串", () => {
      expect(isExternal("")).toBe(false);
    });
  });

  describe("isValidURL()", () => {
    it("应该验证有效的 URL", () => {
      expect(isValidURL("https://www.example.com")).toBe(true);
      expect(isValidURL("http://example.com")).toBe(true);
      expect(isValidURL("https://example.com/path?query=1")).toBe(true);
      expect(isValidURL("http://localhost:3000")).toBe(true);
    });

    it("应该拒绝无效的 URL", () => {
      expect(isValidURL("not-a-url")).toBe(false);
      expect(isValidURL("//example.com")).toBe(false);
      expect(isValidURL("/path")).toBe(false);
      expect(isValidURL("")).toBe(false);
    });
  });

  describe("isEmail()", () => {
    it("应该验证有效的邮箱", () => {
      expect(isEmail("test@example.com")).toBe(true);
      expect(isEmail("user.name@example.com")).toBe(true);
      expect(isEmail("user+tag@example.co.uk")).toBe(true);
      expect(isEmail("123@example.com")).toBe(true);
    });

    it("应该拒绝无效的邮箱", () => {
      expect(isEmail("invalid")).toBe(false);
      expect(isEmail("@example.com")).toBe(false);
      expect(isEmail("user@")).toBe(false);
      expect(isEmail("user @example.com")).toBe(false);
      expect(isEmail("")).toBe(false);
    });
  });

  describe("isMobile()", () => {
    it("应该验证有效的手机号", () => {
      expect(isMobile("13800138000")).toBe(true);
      expect(isMobile("15912345678")).toBe(true);
      expect(isMobile("18612345678")).toBe(true);
      expect(isMobile("19912345678")).toBe(true);
    });

    it("应该拒绝无效的手机号", () => {
      expect(isMobile("12345678901")).toBe(false); // 不是 1 开头的有效号段
      expect(isMobile("1381234567")).toBe(false); // 少于 11 位
      expect(isMobile("138123456789")).toBe(false); // 多于 11 位
      expect(isMobile("abcdefghijk")).toBe(false); // 非数字
      expect(isMobile("")).toBe(false);
    });
  });

  describe("VALIDATORS 对象", () => {
    describe("required 验证器", () => {
      it("应该验证必填项", () => {
        const callback = vi.fn();

        VALIDATORS.required({}, "test", callback);
        expect(callback).toHaveBeenCalledWith(new Error("此项为必填项"));

        callback.mockClear();
        VALIDATORS.required({}, "", callback);
        expect(callback).toHaveBeenCalledWith(new Error("此项为必填项"));

        callback.mockClear();
        VALIDATORS.required({}, null, callback);
        expect(callback).toHaveBeenCalledWith(new Error("此项为必填项"));

        callback.mockClear();
        VALIDATORS.required({}, undefined, callback);
        expect(callback).toHaveBeenCalledWith(new Error("此项为必填项"));
      });

      it("应该通过有效值", () => {
        const callback = vi.fn();

        VALIDATORS.required({}, "value", callback);
        expect(callback).toHaveBeenCalledWith();

        callback.mockClear();
        VALIDATORS.required({}, 0, callback);
        expect(callback).toHaveBeenCalledWith();

        callback.mockClear();
        VALIDATORS.required({}, false, callback);
        expect(callback).toHaveBeenCalledWith();
      });
    });

    describe("email 验证器", () => {
      it("应该验证邮箱格式", () => {
        const callback = vi.fn();

        VALIDATORS.email({}, "invalid", callback);
        expect(callback).toHaveBeenCalledWith(new Error("请输入正确的邮箱地址"));

        callback.mockClear();
        VALIDATORS.email({}, "test@example.com", callback);
        expect(callback).toHaveBeenCalledWith();
      });

      it("应该允许空值", () => {
        const callback = vi.fn();

        VALIDATORS.email({}, "", callback);
        expect(callback).toHaveBeenCalledWith();

        callback.mockClear();
        VALIDATORS.email({}, null, callback);
        expect(callback).toHaveBeenCalledWith();
      });
    });

    describe("mobile 验证器", () => {
      it("应该验证手机号格式", () => {
        const callback = vi.fn();

        VALIDATORS.mobile({}, "12345678901", callback);
        expect(callback).toHaveBeenCalledWith(new Error("请输入正确的手机号码"));

        callback.mockClear();
        VALIDATORS.mobile({}, "13800138000", callback);
        expect(callback).toHaveBeenCalledWith();
      });

      it("应该允许空值", () => {
        const callback = vi.fn();

        VALIDATORS.mobile({}, "", callback);
        expect(callback).toHaveBeenCalledWith();
      });
    });

    describe("url 验证器", () => {
      it("应该验证 URL 格式", () => {
        const callback = vi.fn();

        VALIDATORS.url({}, "not-a-url", callback);
        expect(callback).toHaveBeenCalledWith(new Error("请输入正确的 URL 地址"));

        callback.mockClear();
        VALIDATORS.url({}, "https://example.com", callback);
        expect(callback).toHaveBeenCalledWith();
      });

      it("应该允许空值", () => {
        const callback = vi.fn();

        VALIDATORS.url({}, "", callback);
        expect(callback).toHaveBeenCalledWith();
      });
    });
  });
});
