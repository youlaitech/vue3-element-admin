/**
 * Tenant Plan 租户套餐类型定义
 */

import type { BaseQueryParams } from "./common";

/** 租户套餐分页查询参数 */
export interface TenantPlanQueryParams extends BaseQueryParams {
  /** 关键字(套餐名称/套餐编码) */
  keywords?: string;
  /** 状态(1-启用 0-停用) */
  status?: number;
}

/** 租户套餐分页对象 */
export interface TenantPlanItem {
  id?: number;
  name?: string;
  code?: string;
  status?: number;
  sort?: number;
  remark?: string;
  createTime?: string;
  updateTime?: string;
}

/** 租户套餐表单对象 */
export interface TenantPlanForm {
  id?: number;
  name?: string;
  code?: string;
  status?: number;
  sort?: number;
  remark?: string;
}
