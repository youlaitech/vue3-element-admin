import { PageQueryParam, PageResult } from './base';

/**
 * 角色查询参数类型
 */
export interface RoleQueryParam extends PageQueryParam {
  keywords?: string;
}

/**
 * 角色分页列表项
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
 * 角色分页项类型
 */
export type RolePageResult = PageResult<RoleItem[]>;

/**
 * 角色表单类型
 */
export interface RoleFormData {
  id: string | undefined;
  name: string;
  code: string;
  sort: number;
  status: number;
}

/**
 *
 */
export interface RoleResource {
  menuIds: string[];
  permIds: string[];
}
