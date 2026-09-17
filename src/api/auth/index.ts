import request from "@/utils/request";
import type {
  CaptchaInfo,
  LoginRequest,
  LoginResult,
  QrCodeGenerateResult,
  QrCodeStatusResult,
} from "./types";

const AUTH_BASE_URL = "/api/v1/auth";

const AuthAPI = {
  /**
   * 登录
   */
  login(data: LoginRequest) {
    const payload = {
      username: data.username,
      password: data.password,
      captchaId: data.captchaId,
      captchaCode: data.captchaCode,
      ...(typeof data.tenantId !== "undefined" && { tenantId: data.tenantId }),
    };

    return request<unknown, LoginResult>({
      url: `${AUTH_BASE_URL}/login`,
      method: "post",
      data: payload,
      // 白名单接口携带过期令牌仍会被 Spring Security 判 401
      anonymous: true,
    });
  },

  /**
   * 获取验证码图片
   */
  getCaptcha() {
    return request<unknown, CaptchaInfo>({
      url: `${AUTH_BASE_URL}/captcha`,
      method: "get",
      // 残留过期令牌会让白名单接口 401，登录页取不到验证码
      anonymous: true,
    });
  },

  /**
   * 退出登录
   */
  logout() {
    return request({
      url: `${AUTH_BASE_URL}/logout`,
      method: "delete",
    });
  },

  /**
   * 切换租户并重新签发令牌
   */
  switchTenant(tenantId: number) {
    return request<unknown, LoginResult>({
      url: `${AUTH_BASE_URL}/switch-tenant`,
      method: "post",
      params: { tenantId },
    });
  },

  /**
   * 用刷新令牌换取新的访问令牌
   */
  refreshToken(refreshToken: string) {
    return request<unknown, LoginResult>({
      url: `${AUTH_BASE_URL}/refresh-token`,
      method: "post",
      params: { refreshToken },
      anonymous: true,
    });
  },

  /**
   * 生成扫码登录票据
   */
  qrGenerate(): Promise<QrCodeGenerateResult> {
    return request<unknown, QrCodeGenerateResult>({
      url: `${AUTH_BASE_URL}/qr-code/generate`,
      method: "post",
      anonymous: true,
    });
  },

  /**
   * 轮询扫码登录状态
   */
  qrStatus(ticket: string): Promise<QrCodeStatusResult> {
    return request<unknown, QrCodeStatusResult>({
      url: `${AUTH_BASE_URL}/qr-code/status`,
      method: "get",
      params: { ticket },
      anonymous: true,
    });
  },

  /**
   * 用票据换取登录令牌
   */
  qrLogin(ticket: string): Promise<LoginResult> {
    return request<unknown, LoginResult>({
      url: `${AUTH_BASE_URL}/qr-code/login`,
      method: "post",
      data: { ticket },
      anonymous: true,
    });
  },
};

export default AuthAPI;

export * from "./types";
