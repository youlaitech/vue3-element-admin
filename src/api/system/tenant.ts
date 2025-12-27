import request from "@/utils/request";
import type {
  TenantCreateForm,
  TenantCreateResultVo,
  TenantForm,
  TenantInfo,
  TenantPageQuery,
  TenantPageVo,
} from "@/types/api";

const TENANT_BASE_URL = "/api/v1/tenants";

/**
 * 租户信息
 */

const TenantAPI = {
  /**
   * 获取当前用户可访问的租户列表
   */
  getTenantList() {
    return request<any, TenantInfo[]>({
      url: `${TENANT_BASE_URL}`,
      method: "get",
    });
  },

  /**
   * 获取当前租户信息
   */
  getCurrentTenant() {
    return request<any, TenantInfo>({
      url: `${TENANT_BASE_URL}/current`,
      method: "get",
    });
  },

  /**
   * 切换租户
   *
   * @param tenantId 目标租户ID
   */
  switchTenant(tenantId: number) {
    return request<any, TenantInfo>({
      url: `${TENANT_BASE_URL}/${tenantId}/switch`,
      method: "post",
    });
  },

  /** 获取租户分页数据（平台租户管理） */
  getPage(queryParams?: TenantPageQuery) {
    return request<any, PageResult<TenantPageVo[]>>({
      url: `${TENANT_BASE_URL}/page`,
      method: "get",
      params: queryParams,
    });
  },

  /** 获取租户表单数据 */
  getFormData(tenantId: string) {
    return request<any, TenantForm>({
      url: `${TENANT_BASE_URL}/${tenantId}/form`,
      method: "get",
    });
  },

  /** 新增租户并初始化默认数据 */
  create(data: TenantCreateForm) {
    return request<any, TenantCreateResultVo>({
      url: `${TENANT_BASE_URL}`,
      method: "post",
      data,
    });
  },

  /** 修改租户 */
  update(tenantId: string, data: TenantForm) {
    return request({
      url: `${TENANT_BASE_URL}/${tenantId}`,
      method: "put",
      data,
    });
  },

  /** 删除租户（批量） */
  deleteByIds(ids: string) {
    return request({
      url: `${TENANT_BASE_URL}/${ids}`,
      method: "delete",
    });
  },

  /** 修改租户状态 */
  updateStatus(tenantId: string, status: number) {
    return request({
      url: `${TENANT_BASE_URL}/${tenantId}/status`,
      method: "put",
      params: { status },
    });
  },
};

export default TenantAPI;
