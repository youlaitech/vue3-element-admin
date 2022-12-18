import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { LoginData, TokenResult, VerifyCode } from './types';

/**
 *
 * @param data {LoginForm}
 * @returns
 */
export function loginApi(data: LoginData): AxiosPromise<TokenResult> {
  return request({
    url: '/api/v1/auth/login',
    method: 'post',
    params: data
  });
}

/**
 * 注销
 */
export function logoutApi() {
  return request({
    url: '/api/v1/auth/logout',
    method: 'delete'
  });
}

/**
 * 获取图片验证码
 */
export function getCaptcha(): AxiosPromise<VerifyCode> {
  return request({
    url: '/captcha?t=' + new Date().getTime().toString(),
    method: 'get'
  });
}
