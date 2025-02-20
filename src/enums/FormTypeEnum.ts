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
};
