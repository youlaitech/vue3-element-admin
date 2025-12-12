/**
 * 通用 API 类型定义
 */

export interface ApiResponse<T = any> {
  code: string;
  data: T;
  msg: string;
}

export interface PageQuery {
  pageNum: number;
  pageSize: number;
}

export interface PageResult<T> {
  list: T;
  total: number;
}

export interface OptionType {
  value: string | number;
  label: string;
  children?: OptionType[];
}

export interface ExcelResult {
  code: string;
  invalidCount: number;
  validCount: number;
  messageList: string[];
}
