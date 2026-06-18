/**
 * 登录请求参数
 */
export interface LoginRequest {
  /** 用户名 */
  username: string;
  /** 密码 */
  password: string;
  /** 验证码缓存 key */
  captchaId?: string;
  /** 验证码 */
  captchaCode?: string;
  /** 记住我 */
  rememberMe?: boolean;
  /** 租户 ID */
  tenantId?: number;
}

/**
 * 登录结果
 */
export interface LoginResult {
  /** 访问令牌 */
  accessToken: string;
  /** 刷新令牌 */
  refreshToken: string;
  /** 令牌类型 */
  tokenType: string;
  /** 过期时间(单位:秒) */
  expiresIn: number;
}

/**
 * 验证码信息
 */
export interface CaptchaInfo {
  /** 验证码缓存 key */
  captchaId: string;
  /** 验证码图片 Base64 */
  captchaBase64: string;
}
