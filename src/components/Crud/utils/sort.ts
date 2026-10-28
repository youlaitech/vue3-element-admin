import type { SortExpression } from "@/api/common";

/**
 * Element Plus 表格的排序状态。
 */
export interface TableSort {
  prop?: string | null;
  order: "ascending" | "descending" | null;
}

/**
 * 将表头排序转为接口参数；清除时不发送空规则。
 */
export function buildSort(sort: TableSort, field = sort.prop): SortExpression[] | undefined {
  if (sort.order === null) return undefined;
  if (!field || field.includes(",")) throw new Error("排序列缺少有效的接口属性");
  return [`${field},${sort.order === "ascending" ? "asc" : "desc"}`];
}
