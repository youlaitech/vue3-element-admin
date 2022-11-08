/**
 * 字典查询参数
 */
export interface DictQuery extends PageQuery {
  /**
   * 字典名称
   */
  name?: string;
}

/**
 * 字典类型
 */
export interface Dict {
  id: number;
  code: string;
  name: string;
  status: number;
  remark: string;
}

/**
 * 字典分页项类型声明
 */
export type DictPageResult = PageResult<Dict[]>;

/**
 * 字典表单类型声明
 */
export interface DictTypeForm {
  id: number | undefined;
  name: string;
  code: string;
  status: number;
  remark: string;
}

/**
 * 字典项查询参数类型声明
 */
export interface DictItemQuery extends PageQuery {
  /**
   * 字典项名称
   */
  name?: string;
  /**
   * 字典类型编码
   */
  typeCode?: string;
}

/**
 * 字典数据项类型
 */
export interface DictItem {
  id: number;
  name: string;
  value: string;
  typeCode: string;
  sort: number;
  status: number;
  defaulted: number;
  remark?: string;
}

/**
 * 字典分页项类型声明
 */
export type DictItemPageResult = PageResult<DictItem[]>;

/**
 * 字典表单类型声明
 */
export interface DictItemForm {
  id?: number;
  typeCode?: string;
  typeName?: string;
  name: string;
  code: string;
  value: string;
  status: number;
  sort: number;
  remark: string;
}
