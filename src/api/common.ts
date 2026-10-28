/**
 * API 响应壳
 */
export interface ApiResult<T = unknown> {
  /** 业务状态码 */
  code: string;
  /** 业务数据 */
  data: T;
  /** 业务消息 */
  msg: string;
}

/**
 * 分页与排序条件。
 */
export interface PageQuery {
  /** 页码 */
  pageNum: number;
  /** 每页记录数 */
  pageSize: number;

  /** 排序规则；接口需声明支持的公开属性 */
  sort?: SortExpression[];
}

/**
 * 接口排序方向。
 */
export type SortDirection = "asc" | "desc";

/**
 * 公开排序属性与方向，数组顺序即排序优先级。
 */
export type SortExpression<TField extends string = string> = `${TField},${SortDirection}`;

/**
 * 分页接口结果
 */
export interface PageResult<T> {
  /** 数据列表 */
  list: T[];
  /** 总记录数 */
  total: number;
}

/**
 * 下拉或树形选项。
 */
export interface OptionItem {
  /** 选项值 */
  value: string | number;
  /** 选项标签 */
  label: string;
  /** 子选项 */
  children?: OptionItem[];
}

/**
 * Excel 导入结果
 */
export interface ExcelResult {
  /** 业务状态码 */
  code: string;
  /** 无效数据数量 */
  invalidCount: number;
  /** 有效数据数量 */
  validCount: number;
  /** 错误信息列表 */
  messageList: string[];
}
