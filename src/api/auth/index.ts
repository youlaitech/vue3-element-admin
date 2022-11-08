import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { LoginForm, VerifyCode } from './types';

/**
 *
 * @param data {LoginForm}
 * @returns
 */
export function loginApi(data: LoginForm): AxiosPromise<string> {
  return request({
    url: '/api/v1/auth/login',
    method: 'post',
    params: data,
    headers: {
      Authorization: 'Basic dnVlMy1lbGVtZW50LWFkbWluOnNlY3JldA==' // 客户端信息Base64明文：vue3-element-admin:secret
    }
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
