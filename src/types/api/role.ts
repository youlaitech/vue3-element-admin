/**
 * Role 角色类型定义
 */

/** 角色分页查询参数 */
export interface RolePageQuery extends PageQuery {
  /** 搜索关键字 */
  keywords?: string;
}

/** 角色分页对象 */
export interface RolePageVo {
  /** 角色ID */
  id?: string;
  /** 角色编码 */
  code?: string;
  /** 角色名称 */
  name?: string;
  /** 排序 */
  sort?: number;
  /** 角色状态 */
  status?: number;
  /** 创建时间 */
  createTime?: Date;
  /** 修改时间 */
  updateTime?: Date;
}

/** 角色表单对象 */
export interface RoleForm {
  /** 角色ID */
  id?: string;
  /** 角色编码 */
  code?: string;
  /** 角色名称 */
  name?: string;
  /** 排序 */
  sort?: number;
  /** 数据权限 */
  dataScope?: number;
  /** 角色状态 */
  status?: number;
  /** 备注 */
  remark?: string;
}
