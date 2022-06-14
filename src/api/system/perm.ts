import {
  PermFormData,
  PermItem,
  PermPageResult,
  PermQueryParam,
} from '@/types/api/system/perm';
import request from '@/utils/request';
import { AxiosPromise } from 'axios';

/**
 * 获取权限分页列表
 *
 * @param queryParams
 */
export function listPermPages(
  queryParams: PermQueryParam
): AxiosPromise<PermPageResult> {
  return request({
    url: '/youlai-admin/api/v1/permissions/page',
    method: 'get',
    params: queryParams,
  });
}

/**
 * 获取权限列表
 *
 * @param queryParams
 */
export function listPerms(
  queryParams: PermQueryParam
): AxiosPromise<PermItem[]> {
  return request({
    url: '/youlai-admin/api/v1/permissions',
    method: 'get',
    params: queryParams,
  });
}

/**
 * 获取权限详情
 *
 * @param id
 */
export function getPermFormDetail(id: number): AxiosPromise<PermFormData> {
  return request({
    url: '/youlai-admin/api/v1/permissions/' + id,
    method: 'get',
  });
}

/**
 * 添加权限
 *
 * @param data
 */
export function addPerm(data: PermFormData) {
  return request({
    url: '/youlai-admin/api/v1/permissions',
    method: 'post',
    data: data,
  });
}

/**
 * 更新权限
 *
 * @param id
 * @param data
 */
export function updatePerm(id: number, data: PermFormData) {
  return request({
    url: '/youlai-admin/api/v1/permissions/' + id,
    method: 'put',
    data: data,
  });
}

/**
 * 批量删除权限，多个以英文逗号(,)分割
 *
 * @param ids
 */
export function deletePerms(ids: string) {
  return request({
    url: '/youlai-admin/api/v1/permissions/' + ids,
    method: 'delete',
  });
}
