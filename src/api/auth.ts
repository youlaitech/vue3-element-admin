import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { LoginFormData } from '@/types/api/user';

/**
 * 登录
 */
export function login(data: LoginFormData): AxiosPromise {
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
export function logout() {
  return request({
    url: '/api/v1/auth/logout',
    method: 'delete'
  });
}
