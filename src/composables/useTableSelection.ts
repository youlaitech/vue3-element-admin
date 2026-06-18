import { computed, ref } from "vue";

/**
 * 表格行选择 Composable。
 *
 * 提供统一的表格行选择逻辑，包括选中 ID 管理和清空选择。
 *
 * 规则：
 *
 * - 不和分页状态合并。
 * - 不和弹窗状态合并。
 * - 不和 API 请求合并。
 *
 * @template T 数据项类型，必须包含可选 `id` 属性
 *
 * @example
 * ```ts
 * const { selectedIds, hasSelection, handleSelectionChange } = useTableSelection<RoleItem>();
 * ```
 */
export function useTableSelection<T extends { id?: string | number }>() {
  /** 选中的数据项 ID 列表。 */
  const selectedIds = ref<(string | number)[]>([]);

  /** 选中数量。 */
  const selectedCount = computed(() => selectedIds.value.length);

  /** 是否有选中项。 */
  const hasSelection = computed(() => selectedIds.value.length > 0);

  /**
   * 表格选中项变化处理。
   *
   * @param selection 选中的行数据列表
   */
  function handleSelectionChange(selection: T[]): void {
    selectedIds.value = selection.flatMap((item) => (item.id ? [item.id] : []));
  }

  /**
   * 检查指定 ID 是否被选中。
   *
   * @param id 要检查的 ID
   */
  function isSelected(id: string | number): boolean {
    return selectedIds.value.includes(id);
  }

  /** 清空选中 ID。注意：不会清空表格 UI 上的勾选状态，需页面自行调用表格实例的 `clearSelection`。 */
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
