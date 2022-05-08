import { DeptFormData, DeptItem, DeptQueryParam, Option } from '@/types';
import request from '@/utils/request';
import { AxiosPromise } from 'axios';

/**
 * 部门树形表格
 *
 * @param queryParams
 */
export function listTableDepartments(
  queryParams?: DeptQueryParam
): AxiosPromise<DeptItem[]> {
  return request({
    url: '/youlai-admin/api/v1/depts/table',
    method: 'get',
    params: queryParams
  });
}

/**
 * 部门下拉列表
 */
export function listSelectDepartments(): AxiosPromise<Option[]> {
  return request({
    url: '/youlai-admin/api/v1/depts/select',
    method: 'get'
  });
}

/**
 * 获取部门详情
 *
 * @param id
 */
export function getDeptDetail(id: string): AxiosPromise<DeptFormData> {
  return request({
    url: '/youlai-admin/api/v1/depts/' + id,
    method: 'get'
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
    data: data
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
    data: data
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
    method: 'delete'
  });
}
