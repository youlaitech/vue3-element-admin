import {
  RoleFormData,
  RolePageResult,
  RoleQueryParam,
  RoleResource,
} from '@/types/api/system/role';

import { Option } from '@/types/common';
import request from '@/utils/request';
import { AxiosPromise } from 'axios';

/**
 * 获取角色分页数据
 *
 * @param queryParams
 */
export function listRolePages(
  queryParams?: RoleQueryParam
): AxiosPromise<RolePageResult> {
  return request({
    url: '/youlai-admin/api/v1/roles/pages',
    method: 'get',
    params: queryParams,
  });
}

/**
 * 获取角色下拉数据
 *
 * @param queryParams
 */
export function listRoleOptions(
  queryParams?: RoleQueryParam
): AxiosPromise<Option[]> {
  return request({
    url: '/youlai-admin/api/v1/roles/options',
    method: 'get',
    params: queryParams,
  });
}

/**
 * 获取角色拥有的资源ID集合
 *
 * @param queryParams
 */
export function getRoleResources(roleId: string): AxiosPromise<RoleResource> {
  return request({
    url: '/youlai-admin/api/v1/roles/' + roleId + '/resources',
    method: 'get',
  });
}

/**
 * 修改角色资源权限
 *
 * @param queryParams
 */
export function updateRoleResource(
  roleId: string,
  data: RoleResource
): AxiosPromise<any> {
  return request({
    url: '/youlai-admin/api/v1/roles/' + roleId + '/resources',
    method: 'put',
    data: data,
  });
}

/**
 * 获取角色详情
 *
 * @param id
 */
export function getRoleFormDetail(id: number): AxiosPromise<RoleFormData> {
  return request({
    url: '/youlai-admin/api/v1/roles/' + id,
    method: 'get',
  });
}

/**
 * 添加角色
 *
 * @param data
 */
export function addRole(data: RoleFormData) {
  return request({
    url: '/youlai-admin/api/v1/roles',
    method: 'post',
    data: data,
  });
}

/**
 * 更新角色
 *
 * @param id
 * @param data
 */
export function updateRole(id: number, data: RoleFormData) {
  return request({
    url: '/youlai-admin/api/v1/roles/' + id,
    method: 'put',
    data: data,
  });
}

/**
 * 批量删除角色，多个以英文逗号(,)分割
 *
 * @param ids
 */
export function deleteRoles(ids: string) {
  return request({
    url: '/youlai-admin/api/v1/roles/' + ids,
    method: 'delete',
  });
}
