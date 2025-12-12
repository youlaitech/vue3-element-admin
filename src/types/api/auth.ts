/**
 * 认证相关类型定义
 */

export interface LoginRequest {
  username: string;
  password: string;
  captchaId?: string;
  captchaCode?: string;
  rememberMe?: boolean;
  tenantId?: number;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface CaptchaInfo {
  captchaId: string;
  captchaBase64: string;
}
