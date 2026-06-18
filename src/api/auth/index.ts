import request from "@/utils/request";
import type { CaptchaInfo, LoginRequest, LoginResult } from "./types";

const AUTH_BASE_URL = "/api/v1/auth";

const AuthAPI = {
  login(data: LoginRequest) {
    const payload: Pick<
      LoginRequest,
      "username" | "password" | "captchaId" | "captchaCode" | "tenantId"
    > = {
      username: data.username,
      password: data.password,
      captchaId: data.captchaId,
      captchaCode: data.captchaCode,
    };

    // 仅多租户场景传入 tenantId
    if (typeof data.tenantId !== "undefined") {
      payload.tenantId = data.tenantId;
    }

    return request<unknown, LoginResult>({
      url: `${AUTH_BASE_URL}/login`,
      method: "post",
      data: payload,
    });
  },

  switchTenant(tenantId: number) {
    return request<unknown, LoginResult>({
      url: `${AUTH_BASE_URL}/switch-tenant`,
      method: "post",
      params: { tenantId },
    });
  },

  refreshToken(refreshToken: string) {
    return request<unknown, LoginResult>({
      url: `${AUTH_BASE_URL}/refresh-token`,
      method: "post",
      params: { refreshToken },
      headers: {
        Authorization: "no-auth",
      },
    });
  },

  logout() {
    return request({
      url: `${AUTH_BASE_URL}/logout`,
      method: "delete",
    });
  },

  getCaptcha() {
    return request<unknown, CaptchaInfo>({
      url: `${AUTH_BASE_URL}/captcha`,
      method: "get",
    });
  },
};

export default AuthAPI;

// 重导出类型
export * from "./types";
