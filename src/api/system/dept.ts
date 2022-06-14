import {
  DeptFormData,
  DeptItem,
  DeptQueryParam,
} from '@/types/api/system/dept';
import { Option } from '@/types/common';
import request from '@/utils/request';
import { AxiosPromise } from 'axios';

/**
 * 部门树形表格
 *
 * @param queryParams
 */
export function listDepartments(
  queryParams?: DeptQueryParam
): AxiosPromise<DeptItem[]> {
  return request({
    url: '/youlai-admin/api/v1/depts',
    method: 'get',
    params: queryParams,
  });
}

/**
 * 部门下拉列表
 */
export function listSelectDepartments(): AxiosPromise<Option[]> {
  return request({
    url: '/youlai-admin/api/v1/depts/select_list',
    method: 'get',
  });
}

/**
 * 获取部门详情
 *
 * @param id
 */
export function getDeptForrmData(id: string): AxiosPromise<DeptFormData> {
  return request({
    url: '/youlai-admin/api/v1/depts/' + id + '/form_data',
    method: 'get',
  });
}

/**
 * 新增部门
 *
 * @param data
 */
export function addDept(data: DeptFormData) {
  return request({
    url: '/youlai-admin/api/v1/depts',
    method: 'post',
    data: data,
  });
}

/**
 *  修改部门
 *
 * @param id
 * @param data
 */
export function updateDept(id: string, data: DeptFormData) {
  return request({
    url: '/youlai-admin/api/v1/depts/' + id,
    method: 'put',
    data: data,
  });
}

/**
 * 删除部门
 *
 * @param ids
 */
export function deleteDept(ids: string) {
  return request({
    url: '/youlai-admin/api/v1/depts/' + ids,
    method: 'delete',
  });
}
