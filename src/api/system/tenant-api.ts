import request from "@/utils/request";

const TENANT_BASE_URL = "/api/v1/tenant";

/**
 * 租户信息
 */
export interface TenantInfo {
  /** 租户ID */
  id: number;
  /** 租户名称 */
  name: string;
  /** 租户编码 */
  code?: string;
  /** 租户状态(1-正常 0-禁用) */
  status?: number;
  /** 联系人姓名 */
  contactName?: string;
  /** 联系人电话 */
  contactPhone?: string;
  /** 联系人邮箱 */
  contactEmail?: string;
  /** 租户域名 */
  domain?: string;
  /** 租户Logo */
  logo?: string;
  /** 是否默认租户 */
  isDefault?: boolean;
}

/**
 * 租户 API
 */
const TenantAPI = {
  /**
   * 获取当前用户的租户列表
   */
  getTenantList() {
    return request<any, TenantInfo[]>({
      url: `${TENANT_BASE_URL}/list`,
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
      url: `${TENANT_BASE_URL}/switch/${tenantId}`,
      method: "post",
    });
  },
};

export default TenantAPI;
