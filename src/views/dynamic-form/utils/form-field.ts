/**
 * 表单字段解析
 *
 * @description 从 form-create 规则提取字段元数据、解析提交数据并格式化展示值
 */

/** 表单字段元数据 */
export interface FormFieldMeta {
  /** 字段名 */
  field: string;
  /** 字段标题 */
  title: string;
  /** 选项映射（value -> label）：选项类字段提交的是 value，列表/导出需翻译为 label */
  optionMap: Map<string, string>;
}

/**
 * 递归提取表单字段元数据
 *
 * 布局容器（row/col）自身无 field，其子节点递归收集；
 * 参数为 JSON 解析产物，结构未经校验，按 unknown 逐层探测
 *
 * @param rules form-create 规则（JSON 解析值）
 */
export function extractFields(rules: unknown): FormFieldMeta[] {
  const result: FormFieldMeta[] = [];
  const walk = (nodes: unknown[]): void => {
    nodes.forEach((node) => {
      if (!node || typeof node !== "object") return;
      const item = node as Record<string, unknown>;
      if (typeof item.field === "string" && item.field) {
        result.push({
          field: item.field,
          title: String(item.title ?? item.field),
          optionMap: extractOptionMap(item.options),
        });
      }
      if (Array.isArray(item.children)) {
        walk(item.children);
      }
    });
  };
  walk(Array.isArray(rules) ? rules : []);
  return result;
}

/**
 * 提取字段选项映射（value -> label）
 *
 * 非对象或缺失 value/label 的脏项跳过
 *
 * @param options 规则里的 options 数组（JSON 解析值）
 */
export function extractOptionMap(options: unknown): Map<string, string> {
  const optionMap = new Map<string, string>();
  if (!Array.isArray(options)) return optionMap;
  options.forEach((option) => {
    if (!option || typeof option !== "object") return;
    const { value, label } = option as Record<string, unknown>;
    if (value !== undefined && label !== undefined) {
      optionMap.set(String(value), String(label));
    }
  });
  return optionMap;
}

/**
 * 解析提交数据（field -> value 映射，解析失败按空数据兜底）
 *
 * @param dataJson 数据 JSON 字符串
 */
export function parseDataJson(dataJson?: string): Record<string, unknown> {
  try {
    return dataJson ? (JSON.parse(dataJson) as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

/**
 * 格式化单元格展示值（选项翻译、数组拼接、对象序列化、空值占位）
 *
 * @param value 字段值
 * @param field 字段元数据（选项类字段 value 翻译为 label，未命中映射时原样展示）
 */
export function formatCellValue(value: unknown, field?: FormFieldMeta): string {
  if (value === null || value === undefined || value === "") return "-";
  if (Array.isArray(value)) return value.map((item) => formatCellValue(item, field)).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  const raw = String(value);
  return field?.optionMap.get(raw) ?? raw;
}
