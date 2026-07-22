import request from "@/utils/request";
import type { CaptchaInfo, LoginRequest, LoginResult } from "./types";

/** 申请扫码票据的响应：票据字符串与有效期（秒） */
export interface QrCodeGenerateResult {
  /** 一次扫码登录会话的唯一票据，由 PC 端编码进二维码 */
  ticket: string;
  /** 票据有效期（秒），默认 300，过期后 Redis 自动清理 */
  expireSeconds: number;
}

/** 轮询扫码状态的响应 */
export interface QrCodeStatusResult {
  /** 当前票据 */
  ticket: string;
  /** 状态：WAITING/SCANNED/CONFIRMED/LOGGED_IN/CANCELED/EXPIRED */
  status: "WAITING" | "SCANNED" | "CONFIRMED" | "LOGGED_IN" | "CANCELED" | "EXPIRED";
  /** 脱敏昵称，仅 SCANNED 之后返回，WAITING 为 undefined */
  nickname?: string;
  /** 头像 URL，仅 SCANNED 之后返回 */
  avatar?: string;
  /** 票据剩余有效期（秒） */
  expireSeconds: number;
}

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

  // ============ 扫码登录 ============

  qrGenerate(): Promise<QrCodeGenerateResult> {
    return request<unknown, QrCodeGenerateResult>({
      url: `${AUTH_BASE_URL}/qr-code/generate`,
      method: "post",
    });
  },

  qrStatus(ticket: string): Promise<QrCodeStatusResult> {
    return request<unknown, QrCodeStatusResult>({
      url: `${AUTH_BASE_URL}/qr-code/status`,
      method: "get",
      params: { ticket },
    });
  },

  qrLogin(ticket: string): Promise<LoginResult> {
    return request<unknown, LoginResult>({
      url: `${AUTH_BASE_URL}/qr-code/login`,
      method: "post",
      data: { ticket },
    });
  },
};

export default AuthAPI;

// 重导出类型
export * from "./types";
