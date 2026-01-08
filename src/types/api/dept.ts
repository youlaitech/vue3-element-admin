/**
 * Dept 部门类型定义
 */

/** 部门查询参数 */
export interface DeptQueryParams {
  /** 搜索关键字 */
  keywords?: string;
  /** 状态 */
  status?: number;
}

/** 部门视图对象 */
export interface DeptItem {
  /** 子部门 */
  children?: DeptItem[];
  /** 创建时间 */
  createTime?: Date;
  /** 部门ID */
  id?: string;
  /** 部门名称 */
  name?: string;
  /** 父部门ID */
  parentId?: string;
  /** 排序 */
  sort?: number;
  /** 状态(1:启用；0:禁用) */
  status?: number;
  /** 父节点ID路径 */
  treePath?: string;
  /** 修改时间 */
  updateTime?: Date;
}

/** 部门表单对象 */
export interface DeptForm {
  /** 部门ID */
  id?: string;
  /** 部门名称 */
  name?: string;
  /** 部门编号 */
  code?: string;
  /** 父部门ID */
  parentId?: string;
  /** 排序 */
  sort?: number;
  /** 状态(1:启用；0:禁用) */
  status?: number;
}
