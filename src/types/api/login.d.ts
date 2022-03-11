/**
 * 登录请求参数
 */
export interface LoginRequestParam {
    username: string,
    password: string,
    grant_type: string,
    code: string,
    uuid: string,
}

/**
 * 登录响应参数
 */
export interface LoginResponseData {
    access_token: string,
    token_type: string
}