import { PageQueryParam, PageResult } from '../base';

/**
 * 权限查询参数类型声明
 */
export interface PermQueryParam extends PageQueryParam {
  menuId: any;
  name: string | undefined;
}

/**
 * 权限分页列表项声明
 */
export interface PermItem {
  id: number;
  name: string;
  menuId: string;
  urlPerm: string;
  btnPerm: string;
  roles?: string[];
}

/**
 * 权限分页项类型声明
 */
export type PermPageResult = PageResult<PermItem[]>;

/**
 * 权限表单类型声明
 */
export interface PermFormData {
  id: number | undefined;
  name: string;
  urlPerm: string;
  btnPerm: string;
  menuId: string;
}
