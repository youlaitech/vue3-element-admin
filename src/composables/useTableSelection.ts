import { computed, ref } from "vue";

/**
 * 表格行选择 Composable
 *
 * @description 提供统一的表格行选择逻辑，包括选中ID管理和清空选择
 * @template T 数据项类型，必须包含 id 属性
 * @returns 返回选中的ID列表、选择变化处理函数、清空选择函数
 *
 * @example
 * ```typescript
 * const { selectedIds, handleSelectionChange, clearSelection } = useTableSelection<UserVO>();
 * ```
 */
export function useTableSelection<T extends { id: string | number }>() {
  /**
   * 选中的数据项ID列表
   */
  const selectedIds = ref<(string | number)[]>([]);

  /**
   * 表格选中项变化处理
   * @param selection 选中的行数据列表
   */
  function handleSelectionChange(selection: T[]): void {
    selectedIds.value = selection.map((item) => item.id);
  }

  /**
   * 清空选择
   */
  function clearSelection(): void {
    selectedIds.value = [];
  }

  /**
   * 检查指定ID是否被选中
   * @param id 要检查的ID
   * @returns 是否被选中
   */
  function isSelected(id: string | number): boolean {
    return selectedIds.value.includes(id);
  }

  /**
   * 获取选中的数量
   */
  const selectedCount = computed(() => selectedIds.value.length);

  /**
   * 是否有选中项
   */
  const hasSelection = computed(() => selectedIds.value.length > 0);

  return {
    selectedIds,
    selectedCount,
    hasSelection,
    handleSelectionChange,
    clearSelection,
    isSelected,
  };
}
