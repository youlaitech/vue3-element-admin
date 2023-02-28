/**
 * 登录请求
 */
export interface LoginData {
  username: string;
  password: string;
}

/**
 * 登录详情
 */
export interface LoginResult {
  accessToken: string;
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
