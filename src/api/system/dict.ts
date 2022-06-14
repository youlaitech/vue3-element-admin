import { Option } from '@/types/common';
import {
  DictFormTypeData,
  DictItemFormData,
  DictItemPageResult,
  DictItemQueryParam,
  DictPageResult,
  DictQueryParam,
} from '@/types/api/system/dict';
import request from '@/utils/request';
import { AxiosPromise } from 'axios';

/**
 * 获取字典分页列表
 *
 * @param queryParams
 */
export function listPageDictTypes(
  queryParams: DictQueryParam
): AxiosPromise<DictPageResult> {
  return request({
    url: '/youlai-admin/api/v1/dict-types',
    method: 'get',
    params: queryParams,
  });
}

/**
 * 获取字典详情
 *
 * @param id
 */
export function getDictFormData(id: number): AxiosPromise<DictFormTypeData> {
  return request({
    url: '/youlai-admin/api/v1/dict-types/' + id + '/form_data',
    method: 'get',
  });
}

/**
 * 新增字典类型
 *
 * @param data
 */
export function addDictType(data: DictFormTypeData) {
  return request({
    url: '/youlai-admin/api/v1/dict-types',
    method: 'post',
    data: data,
  });
}

/**
 * 修改字典类型
 *
 * @param id
 * @param data
 */
export function updateDictType(id: number, data: DictFormTypeData) {
  return request({
    url: '/youlai-admin/api/v1/dict-types/' + id,
    method: 'put',
    data: data,
  });
}

/**
 * 批量删除字典类型
 *
 * @param ids 字典类型ID，多个以英文逗号(,)分割
 */
export function deleteDictTypes(ids: string) {
  return request({
    url: '/youlai-admin/api/v1/dict-types/' + ids,
    method: 'delete',
  });
}

/**
 * 获取字典项分页列表
 *
 * @param queryParams
 */
export function listPageDictItems(
  queryParams: DictItemQueryParam
): AxiosPromise<DictItemPageResult> {
  return request({
    url: '/youlai-admin/api/v1/dict-items',
    method: 'get',
    params: queryParams,
  });
}

/**
 * 根据字典类型编码获取字典数据项
 *
 * @param typeCode 字典类型编码
 */
export function getDictItemsByTypeCode(
  typeCode: string
): AxiosPromise<Option[]> {
  return request({
    url: '/youlai-admin/api/v1/dict-items/select_list',
    method: 'get',
    params: { typeCode: typeCode },
  });
}

/**
 * 获取字典数据项表单
 *
 * @param id
 */
export function getDictItemData(id: number): AxiosPromise<DictItemFormData> {
  return request({
    url: '/youlai-admin/api/v1/dict-items/' + id + '/form_data',
    method: 'get',
  });
}

/**
 * 新增字典项
 *
 * @param data
 */
export function addDictItem(data: DictItemFormData) {
  return request({
    url: '/youlai-admin/api/v1/dict-items',
    method: 'post',
    data: data,
  });
}

/**
 * 修改字典项
 *
 * @param id
 * @param data
 */
export function updateDictItem(id: number, data: DictItemFormData) {
  return request({
    url: '/youlai-admin/api/v1/dict-items/' + id,
    method: 'put',
    data: data,
  });
}

/**
 * 批量删除字典数据项
 *
 * @param ids 字典项ID，多个以英文逗号(,)分割
 */
export function deleteDictItems(ids: string) {
  return request({
    url: '/youlai-admin/api/v1/dict-items/' + ids,
    method: 'delete',
  });
}
