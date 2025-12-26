import { describe, it, expect } from "vitest";
import { formatGrowthRate, formatFileSize, formatNumber, formatCurrency } from "@/utils/format";

describe("Format 工具函数", () => {
  describe("formatGrowthRate()", () => {
    it("应该格式化正增长率", () => {
      expect(formatGrowthRate(0.25)).toBe("+25.00%");
      expect(formatGrowthRate(0.5)).toBe("+50.00%");
      expect(formatGrowthRate(1.5)).toBe("+150.00%");
    });

    it("应该格式化负增长率", () => {
      expect(formatGrowthRate(-0.25)).toBe("-25.00%");
      expect(formatGrowthRate(-0.5)).toBe("-50.00%");
    });

    it("应该格式化零增长率", () => {
      expect(formatGrowthRate(0)).toBe("0.00%");
    });

    it("应该处理小数精度", () => {
      expect(formatGrowthRate(0.12345)).toBe("+12.35%");
      expect(formatGrowthRate(0.12344)).toBe("+12.34%");
    });

    it("应该处理 null 和 undefined", () => {
      expect(formatGrowthRate(null as any)).toBe("0.00%");
      expect(formatGrowthRate(undefined as any)).toBe("0.00%");
    });
  });

  describe("formatFileSize()", () => {
    it("应该格式化字节", () => {
      expect(formatFileSize(0)).toBe("0 B");
      expect(formatFileSize(100)).toBe("100 B");
      expect(formatFileSize(1023)).toBe("1023 B");
    });

    it("应该格式化 KB", () => {
      expect(formatFileSize(1024)).toBe("1.00 KB");
      expect(formatFileSize(1536)).toBe("1.50 KB");
      expect(formatFileSize(10240)).toBe("10.00 KB");
    });

    it("应该格式化 MB", () => {
      expect(formatFileSize(1048576)).toBe("1.00 MB");
      expect(formatFileSize(5242880)).toBe("5.00 MB");
    });

    it("应该格式化 GB", () => {
      expect(formatFileSize(1073741824)).toBe("1.00 GB");
      expect(formatFileSize(5368709120)).toBe("5.00 GB");
    });

    it("应该格式化 TB", () => {
      expect(formatFileSize(1099511627776)).toBe("1.00 TB");
    });

    it("应该处理负数", () => {
      expect(formatFileSize(-1024)).toBe("0 B");
    });

    it("应该处理 null 和 undefined", () => {
      expect(formatFileSize(null as any)).toBe("0 B");
      expect(formatFileSize(undefined as any)).toBe("0 B");
    });
  });

  describe("formatNumber()", () => {
    it("应该格式化整数", () => {
      expect(formatNumber(1000)).toBe("1,000");
      expect(formatNumber(1000000)).toBe("1,000,000");
      expect(formatNumber(123456789)).toBe("123,456,789");
    });

    it("应该格式化小数", () => {
      expect(formatNumber(1000.5)).toBe("1,000.5");
      expect(formatNumber(1234.56)).toBe("1,234.56");
    });

    it("应该处理小数位数", () => {
      expect(formatNumber(1234.5678, 2)).toBe("1,234.57");
      expect(formatNumber(1234.5, 2)).toBe("1,234.50");
      expect(formatNumber(1234, 2)).toBe("1,234.00");
    });

    it("应该处理零", () => {
      expect(formatNumber(0)).toBe("0");
      expect(formatNumber(0, 2)).toBe("0.00");
    });

    it("应该处理负数", () => {
      expect(formatNumber(-1000)).toBe("-1,000");
      expect(formatNumber(-1234.56, 2)).toBe("-1,234.56");
    });

    it("应该处理 null 和 undefined", () => {
      expect(formatNumber(null as any)).toBe("0");
      expect(formatNumber(undefined as any)).toBe("0");
    });
  });

  describe("formatCurrency()", () => {
    it("应该格式化货币（默认人民币）", () => {
      expect(formatCurrency(1000)).toBe("¥1,000.00");
      expect(formatCurrency(1234.56)).toBe("¥1,234.56");
      expect(formatCurrency(1000000)).toBe("¥1,000,000.00");
    });

    it("应该格式化美元", () => {
      expect(formatCurrency(1000, "USD")).toBe("$1,000.00");
      expect(formatCurrency(1234.56, "USD")).toBe("$1,234.56");
    });

    it("应该格式化欧元", () => {
      expect(formatCurrency(1000, "EUR")).toBe("€1,000.00");
    });

    it("应该格式化日元", () => {
      expect(formatCurrency(1000, "JPY")).toBe("¥1,000");
    });

    it("应该处理零", () => {
      expect(formatCurrency(0)).toBe("¥0.00");
    });

    it("应该处理负数", () => {
      expect(formatCurrency(-1000)).toBe("-¥1,000.00");
    });

    it("应该处理 null 和 undefined", () => {
      expect(formatCurrency(null as any)).toBe("¥0.00");
      expect(formatCurrency(undefined as any)).toBe("¥0.00");
    });
  });
});
