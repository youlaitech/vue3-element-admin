import { PageQueryParam, PageResult } from '../base';

/**
 * 角色查询参数类型声明
 */
export interface RoleQueryParam extends PageQueryParam {
  name?: string;
}

/**
 * 角色分页列表项声明
 */
export interface RoleItem {
  id: string;
  name: string;
  code: string;
  sort: number;
  status: number;
  deleted: number;
  menuIds?: any;
  permissionIds?: any;
}

/**
 * 角色分页项类型声明
 */
export type RolePageResult = PageResult<RoleItem[]>;

/**
 * 角色表单类型声明
 */
export interface RoleFormData {
  id: number | undefined;
  name: string;
  code: string;
  sort: number;
  status: number;
}
