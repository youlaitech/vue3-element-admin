/**
 * Tenant 租户类型定义
 */

import type { PageQuery } from "./common";

/** 租户信息 */
export interface TenantInfo {
  /** 租户ID */
  id: number;
  /** 租户名称 */
  name: string;
  /** 租户域名 */
  domain?: string;
}

/** 租户分页查询参数 */
export interface TenantPageQuery extends PageQuery {
  /** 关键字(租户名称/租户编码/域名) */
  keywords?: string;
  /** 租户状态(1-正常 0-禁用) */
  status?: number;
}

/** 租户分页对象 */
export interface TenantPageVo {
  id?: string;
  name?: string;
  code?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  domain?: string;
  logo?: string;
  status?: number;
  remark?: string;
  expireTime?: string;
  createTime?: string;
  updateTime?: string;
}

/** 租户表单对象（编辑） */
export interface TenantForm {
  id?: string;
  name?: string;
  code?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  domain?: string;
  logo?: string;
  status?: number;
  remark?: string;
  expireTime?: string;
}

/** 新增租户表单对象 */
export interface TenantCreateForm {
  name?: string;
  code?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  domain?: string;
  logo?: string;
  remark?: string;
  expireTime?: string;
  adminUsername?: string;
}

/** 新增租户结果 */
export interface TenantCreateResultVo {
  tenantId?: string;
  tenantCode?: string;
  tenantName?: string;
  adminUsername?: string;
  adminInitialPassword?: string;
  adminRoleCode?: string;
}
