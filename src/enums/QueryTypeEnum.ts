/**
 * 查询类型枚举
 */
export const QueryTypeEnum: Record<string, OptionType> = {
  /** 等于 */
  EQ: { value: 1, label: "=" },

  /** 模糊匹配 */
  LIKE: { value: 2, label: "LIKE '%s%'" },

  /** 包含 */
  IN: { value: 3, label: "IN" },

  /** 范围 */
  BETWEEN: { value: 4, label: "BETWEEN" },

  /** 大于 */
  GT: { value: 5, label: ">" },

  /** 大于等于 */
  GE: { value: 6, label: ">=" },

  /** 小于 */
  LT: { value: 7, label: "<" },

  /** 小于等于 */
  LE: { value: 8, label: "<=" },

  /** 不等于 */
  NE: { value: 9, label: "!=" },

  /** 左模糊匹配 */
  LIKE_LEFT: { value: 10, label: "LIKE '%s'" },

  /** 右模糊匹配 */
  LIKE_RIGHT: { value: 11, label: "LIKE 's%'" },
};
