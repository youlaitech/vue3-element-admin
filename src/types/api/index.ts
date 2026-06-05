

export interface PageQueryParams {
  pageNum: number;
  pageSize: number;
  [key: string]: any;
}


export interface OptionItem {
  label: string;
  value: string | number;
  meta?: any;
  children?: OptionItem[];
}

export interface ExcelResult {
  /** 状态码 */
  code: number;
  /** 无效数据条数 */
  invalidCount: number;
  /** 有效数据条数 */
  validCount: number;
  /** 错误信息 */
  messageList: Array<string>;
}

export interface PageResult<T> {
  total: number;
  list: T[];
}

export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

export interface BaseEntity {
  id: number;
  createTime: string;
  updateTime: string;
}

