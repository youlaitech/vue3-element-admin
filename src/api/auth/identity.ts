import request from "@/utils/request";

const USER_BASE_URL = "/api/v1/users";

/**
 * 服务端配置的认证中心及当前用户的关联。
 */
export interface OidcUserIdentity {
  /** 只读，由后端配置提供。 */
  issuer: string;
  /** ID Token 的 sub；未关联时为空。 */
  subject?: string | null;
}

/**
 * 设置当前认证源下的用户身份，不提交 issuer 或 provider。
 */
export interface OidcUserIdentityForm {
  subject: string;
}

const IdentityAPI = {
  /**
   * 读取当前认证中心及用户身份；未关联时 subject 为空。
   */
  get(userId: string) {
    return request<unknown, OidcUserIdentity>({
      url: `${USER_BASE_URL}/${userId}/oidc-identity`,
      method: "get",
    });
  },

  /**
   * 保存或替换用户身份；重复保存同一个 subject 不产生额外变更。
   */
  set(userId: string, data: OidcUserIdentityForm) {
    return request<unknown, void>({
      url: `${USER_BASE_URL}/${userId}/oidc-identity`,
      method: "put",
      data,
    });
  },

  /**
   * 解除当前认证源的身份关联，重复解除可成功。
   */
  remove(userId: string) {
    return request<unknown, void>({
      url: `${USER_BASE_URL}/${userId}/oidc-identity`,
      method: "delete",
    });
  },
};

export default IdentityAPI;
