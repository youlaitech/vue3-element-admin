/**
 * Dict 字典类型定义
 */

/** 字典分页查询参数 */

export interface DictPageQuery extends PageQuery {
  /** 搜索关键字 */
  keywords?: string;
  /** 状态(1:启用;0:禁用) */
  status?: number;
}

/** 字典分页对象 */
export interface DictPageVo {
  /** 字典ID */
  id: string;
  /** 字典名称 */
  name: string;
  /** 字典编码 */
  dictCode: string;
  /** 状态(1:启用;0:禁用) */
  status: number;
}

/** 字典表单对象 */
export interface DictForm {
  /** 字典ID */
  id?: string;
  /** 字典名称 */
  name?: string;
  /** 字典编码 */
  dictCode?: string;
  /** 状态(1:启用;0:禁用) */
  status?: number;
  /** 备注 */
  remark?: string;
}

/** 字典项分页查询参数 */
export interface DictItemPageQuery extends PageQuery {
  /** 搜索关键字 */
  keywords?: string;
  /** 字典编码 */
  dictCode?: string;
}

/** 字典项分页对象 */
export interface DictItemPageVo {
  /** 字典项ID */
  id: string;
  /** 字典编码 */
  dictCode: string;
  /** 字典项标签 */
  label: string;
  /** 字典项值 */
  value: string;
  /** 状态(1:启用;0:禁用) */
  status: number;
  /** 排序 */
  sort?: number;
}

/** 字典项表单对象 */
export interface DictItemForm {
  /** 字典项ID */
  id?: string;
  /** 字典编码 */
  dictCode?: string;
  /** 字典项标签 */
  label?: string;
  /** 字典项值 */
  value?: string;
  /** 状态(1:启用;0:禁用) */
  status?: number;
  /** 排序 */
  sort?: number;
  /** 标签类型 */
  tagType?: "success" | "warning" | "info" | "primary" | "danger" | "";
}

/** 字典项选项 */
export interface DictItemOption {
  /** 字典项值 */
  value: number | string;
  /** 字典项标签 */
  label: string;
  /** 标签类型 */
  tagType?: "success" | "warning" | "info" | "primary" | "danger" | "";
}
