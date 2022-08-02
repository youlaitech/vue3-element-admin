import {
  MenuFormData,
  MenuItem,
  MenuQueryParam,
  Resource,
} from '@/types/api/system/menu';
import { Option } from '@/types/common';
import request from '@/utils/request';
import { AxiosPromise } from 'axios';

/**
 * 获取路由列表
 */
export function listRoutes() {
  return request({
    url: '/youlai-admin/api/v1/menus/routes',
    method: 'get',
  });
}

/**
 * 获取菜单表格列表
 *
 * @param queryParams
 */
export function listMenus(
  queryParams: MenuQueryParam
): AxiosPromise<MenuItem[]> {
  return request({
    url: '/youlai-admin/api/v1/menus',
    method: 'get',
    params: queryParams,
  });
}

/**
 * 获取菜单下拉树形列表
 */
export function listMenuOptions(): AxiosPromise<Option[]> {
  return request({
    url: '/youlai-admin/api/v1/menus/options',
    method: 'get',
  });
}

/**
 * 获取资源(菜单+权限)树形列表
 */
export function listResources(): AxiosPromise<Resource[]> {
  return request({
    url: '/youlai-admin/api/v1/menus/resources',
    method: 'get',
  });
}

/**
 * 获取菜单详情
 * @param id
 */
export function getMenuDetail(id: string): AxiosPromise<MenuFormData> {
  return request({
    url: '/youlai-admin/api/v1/menus/' + id,
    method: 'get',
  });
}

/**
 * 添加菜单
 *
 * @param data
 */
export function addMenu(data: MenuFormData) {
  return request({
    url: '/youlai-admin/api/v1/menus',
    method: 'post',
    data: data,
  });
}

/**
 * 修改菜单
 *
 * @param id
 * @param data
 */
export function updateMenu(id: string, data: MenuFormData) {
  return request({
    url: '/youlai-admin/api/v1/menus/' + id,
    method: 'put',
    data: data,
  });
}

/**
 * 批量删除菜单
 *
 * @param ids 菜单ID，多个以英文逗号(,)分割
 */
export function deleteMenus(ids: string) {
  return request({
    url: '/youlai-admin/api/v1/menus/' + ids,
    method: 'delete',
  });
}
