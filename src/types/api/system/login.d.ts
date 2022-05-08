/**
 * 登录表单类型声明
 */
export interface LoginFormData {
  username: string;
  password: string;
  grant_type: string;
  code: string;
  uuid: string;
}

/**
 * 登录响应类型声明
 */
export interface LoginResponseData {
  access_token: string;
  token_type: string;
}

/**
 * 验证码类型声明
 */
export interface Captcha {
  img: string;
  uuid: string;
}
