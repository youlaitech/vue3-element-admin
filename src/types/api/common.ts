/**
 * 通用 API 类型定义
 */

/** API 响应结构 */
export interface ApiResponse<T = any> {
  /** 响应码 */
  code: string;
  /** 响应数据 */
  data: T;
  /** 响应消息 */
  msg: string;
}

/** 分页查询参数 */
export interface PageQuery {
  /** 页码 */
  pageNum: number;
  /** 每页记录数 */
  pageSize: number;
}

/** 分页响应结构 */
export interface PageResult<T> {
  /** 数据列表 */
  list: T;
  /** 总记录数 */
  total: number;
}

/** 下拉选项 */
export interface OptionType {
  /** 选项值 */
  value: string | number;
  /** 选项标签 */
  label: string;
  /** 子选项 */
  children?: OptionType[];
}

/** Excel 导入结果 */
export interface ExcelResult {
  /** 响应码 */
  code: string;
  /** 无效数据数量 */
  invalidCount: number;
  /** 有效数据数量 */
  validCount: number;
  /** 错误信息列表 */
  messageList: string[];
}
