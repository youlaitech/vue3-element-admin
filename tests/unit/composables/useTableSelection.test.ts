import { describe, it, expect, beforeEach } from "vitest";
import { useTableSelection } from "@/composables/table/useTableSelection";

describe("useTableSelection", () => {
  let selection: ReturnType<typeof useTableSelection>;

  beforeEach(() => {
    selection = useTableSelection();
  });

  it("应该初始化为空数组", () => {
    expect(selection.selectedIds.value).toEqual([]);
    expect(selection.selectedRows.value).toEqual([]);
  });

  describe("handleSelectionChange()", () => {
    it("应该更新选中的行", () => {
      const rows = [
        { id: 1, name: "张三" },
        { id: 2, name: "李四" },
      ];

      selection.handleSelectionChange(rows);

      expect(selection.selectedRows.value).toEqual(rows);
      expect(selection.selectedIds.value).toEqual([1, 2]);
    });

    it("应该处理空数组", () => {
      selection.handleSelectionChange([]);

      expect(selection.selectedRows.value).toEqual([]);
      expect(selection.selectedIds.value).toEqual([]);
    });

    it("应该支持自定义 ID 字段", () => {
      const customSelection = useTableSelection("userId");
      const rows = [
        { userId: "u1", name: "张三" },
        { userId: "u2", name: "李四" },
      ];

      customSelection.handleSelectionChange(rows);

      expect(customSelection.selectedIds.value).toEqual(["u1", "u2"]);
    });
  });

  describe("clearSelection()", () => {
    it("应该清空选中项", () => {
      const rows = [{ id: 1, name: "张三" }];
      selection.handleSelectionChange(rows);

      selection.clearSelection();

      expect(selection.selectedIds.value).toEqual([]);
      expect(selection.selectedRows.value).toEqual([]);
    });
  });

  describe("hasSelection", () => {
    it("有选中项时应该返回 true", () => {
      const rows = [{ id: 1, name: "张三" }];
      selection.handleSelectionChange(rows);

      expect(selection.hasSelection.value).toBe(true);
    });

    it("无选中项时应该返回 false", () => {
      expect(selection.hasSelection.value).toBe(false);
    });
  });

  describe("selectionCount", () => {
    it("应该返回选中项数量", () => {
      expect(selection.selectionCount.value).toBe(0);

      const rows = [
        { id: 1, name: "张三" },
        { id: 2, name: "李四" },
        { id: 3, name: "王五" },
      ];
      selection.handleSelectionChange(rows);

      expect(selection.selectionCount.value).toBe(3);
    });
  });
});
