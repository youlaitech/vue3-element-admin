/**
 * 登录表单类型声明
 */
export interface LoginForm {
  username: string;
  password: string;
  grant_type: string;
  /**
   * 验证码Code
   */
  //verifyCode: string;
  /**
   * 验证码Code服务端缓存key(UUID)
   */
  // verifyCodeKey: string;
}

/**
 * 登录响应类型声明
 */
export interface LoginResult {
  access_token: string;
  token_type: string;
}

/**
 * 验证码类型声明
 */
export interface VerifyCode {
  verifyCodeImg: string;
  verifyCodeKey: string;
}
