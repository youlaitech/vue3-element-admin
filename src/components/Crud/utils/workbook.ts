import type { CellValue, Worksheet } from "exceljs";

/**
 * 导入接口返回的有效行、无效行及错误摘要。
 */
export interface ImportSummary {
  validCount: number;
  invalidCount: number;
  messages: string[];
}

/**
 * 识别项目的 ExcelResult；无返回值的导入接口不需要适配。
 */
export function readImportSummary(result: unknown): ImportSummary | undefined {
  if (!result || typeof result !== "object") return undefined;
  const validCount: unknown = Reflect.get(result, "validCount");
  const invalidCount: unknown = Reflect.get(result, "invalidCount");
  const messages: unknown = Reflect.get(result, "messageList");
  if (!Object.hasOwn(result, "validCount") && !Object.hasOwn(result, "invalidCount"))
    return undefined;
  if (
    typeof validCount !== "number" ||
    typeof invalidCount !== "number" ||
    !Number.isSafeInteger(validCount) ||
    !Number.isSafeInteger(invalidCount) ||
    validCount < 0 ||
    invalidCount < 0
  )
    throw new Error("导入接口返回的统计格式不正确");
  return {
    validCount,
    invalidCount,
    messages: Array.isArray(messages)
      ? messages.filter((value: unknown): value is string => typeof value === "string")
      : [],
  };
}

/**
 * 表头按列号映射，保留中间空列；重复表头和有数据的无标题列明确报错。
 */
export function parseWorksheetRows(worksheet: Worksheet): Record<string, CellValue>[] {
  const headers = new Map<number, string>();
  const names = new Set<string>();
  worksheet.getRow(1).eachCell((cell, column) => {
    const name = cell.text.trim();
    if (!name) return;
    if (names.has(name)) throw new Error(`表头重复：${name}`);
    names.add(name);
    headers.set(column, name);
  });
  const rows: Record<string, CellValue>[] = [];
  worksheet.eachRow((row, index) => {
    if (index === 1) return;
    const data: Record<string, CellValue> = {};
    row.eachCell((cell, column) => {
      const name = headers.get(column);
      if (!name) throw new Error(`第 ${column} 列缺少表头`);
      data[name] = cell.value;
    });
    if (Object.keys(data).length) rows.push(data);
  });
  return rows;
}
