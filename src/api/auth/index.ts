import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { LoginData, LoginResult } from './types';

/**
 *
 * @param data {LoginData}
 * @returns
 */
export function loginApi(data: LoginData): AxiosPromise<LoginResult> {
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
