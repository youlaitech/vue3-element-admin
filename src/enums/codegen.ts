/**
 * 代码生成相关枚举
 *
 * @description
 * 包含表单类型、查询类型等代码生成功能的枚举定义
 */

/**
 * 表单类型枚举
 */
export const FormTypeEnum: Record<string, OptionType> = {
  INPUT: { value: 1, label: "输入框" },
  SELECT: { value: 2, label: "下拉框" },
  RADIO: { value: 3, label: "单选框" },
  CHECK_BOX: { value: 4, label: "复选框" },
  INPUT_NUMBER: { value: 5, label: "数字输入框" },
  SWITCH: { value: 6, label: "开关" },
  TEXT_AREA: { value: 7, label: "文本域" },
  DATE: { value: 8, label: "日期框" },
  DATE_TIME: { value: 9, label: "日期时间框" },
  HIDDEN: { value: 10, label: "隐藏域" },
};

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
