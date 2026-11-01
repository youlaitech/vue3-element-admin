import { computed, ref } from "vue";

/**
 * 管理选中 ID；分页、弹窗和表格 UI 勾选由页面持有。
 */
export function useTableSelection<T extends { id?: string | number }>() {
  const selectedIds = ref<(string | number)[]>([]);

  const selectedCount = computed(() => selectedIds.value.length);

  const hasSelection = computed(() => selectedIds.value.length > 0);

  /**
   * 保存表格勾选记录。
   */
  function handleSelectionChange(selection: T[]): void {
    selectedIds.value = selection.flatMap((item) =>
      item.id === undefined || item.id === null ? [] : [item.id],
    );
  }

  /**
   * 检查指定记录是否已被勾选。
   */
  function isSelected(id: string | number): boolean {
    return selectedIds.value.includes(id);
  }

  /**
   * 清空选中 ID（不改变表格 UI 勾选状态，需页面自行调用表格实例的 `clearSelection`）
   */
  function clearSelection(): void {
    selectedIds.value = [];
  }

  return {
    selectedIds,
    selectedCount,
    hasSelection,
    handleSelectionChange,
    clearSelection,
    isSelected,
  };
}
