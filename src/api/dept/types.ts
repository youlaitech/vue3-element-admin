/**
 * 部门查询参数
 */
export interface DeptQuery {
  keywords?: string;
  status?: number;
}

/**
 * 部门类型
 */
export interface DeptVO {
  /**
   * 子部门
   */
  children?: DeptVO[];
  /**
   * 创建时间
   */
  createTime?: Date;
  /**
   * 部门ID
   */
  id?: number;
  /**
   * 部门名称
   */
  name?: string;
  /**
   * 父部门ID
   */
  parentId?: number;
  /**
   * 排序
   */
  sort?: number;
  /**
   * 状态(1:启用；0:禁用)
   */
  status?: number;
  /**
   * 修改时间
   */
  updateTime?: Date;
}

/**
 * 部门表单类型
 */
export interface DeptForm {
  /**
   * 部门ID(新增不填)
   */
  id?: number;
  /**
   * 部门名称
   */
  name?: string;
  /**
   * 父部门ID
   */
  parentId: number;
  /**
   * 排序
   */
  sort?: number;
  /**
   * 状态(1:启用；0：禁用)
   */
  status?: number;
}
