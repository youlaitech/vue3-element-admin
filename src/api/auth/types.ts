/**
 * 登录请求
 */
export interface LoginData {
  username: string;
  password: string;
}

/**
 * 登录响应
 */
export interface LoginResult {
  accessToken: string;
  tokenType: string;
  refreshToken: string;
  expires: number;
}

/**
 * 验证码类型
 */
export interface VerifyCode {
  verifyCodeImg: string;
  verifyCodeKey: string;
}
