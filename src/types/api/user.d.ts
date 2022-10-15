import { PageQueryParam, PageResult } from './base';

/**
 * 登录表单
 */
export interface LoginFormData {
  username: string;
  password: string;
  grant_type: string;
}

/**
 * 登录响应
 */
export interface LoginResponseData {
  access_token: string;
  token_type: string;
}

/**
 * 登录用户信息
 */
export interface UserInfo {
  nickname: string;
  avatar: string;
  roles: string[];
  perms: string[];
}

/**
 * 用户查询参数
 */
export interface UserQueryParam extends PageQueryParam {
  keywords: string;
  status: number;
  deptId: number;
}

/**
 * 用户分页列表项声明
 */
export interface UserItem {
  id: string;
  username: string;
  nickname: string;
  mobile: string;
  gender: number;
  avatar: string;
  email: string;
  status: number;
  deptName: string;
  roleNames: string;
  createTime: string;
}

/**
 * 用户分页项类型声明
 */
export type UserPageResult = PageResult<UserItem[]>;

/**
 * 用户表单类型声明
 */
export interface UserFormData {
  id: number | undefined;
  deptId: number;
  username: string;
  nickname: string;
  password: string;
  mobile: string;
  email: string;
  gender: number;
  status: number;
  remark: string;
  roleIds: number[];
}

/**
 * 用户导入表单类型声明
 */
export interface UserImportFormData {
  deptId: number;
  roleIds: number[];
}
