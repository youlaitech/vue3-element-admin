import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import {
  DictQuery,
  DictPageResult,
  DictTypeForm,
  DictItemQuery,
  DictItemPageResult,
  DictItemForm
} from './types';

/**
 * 获取字典类型分页列表
 *
 * @param queryParams
 */
export function listDictTypePages(
  queryParams: DictQuery
): AxiosPromise<DictPageResult> {
  return request({
    url: '/api/v1/dict/types/pages',
    method: 'get',
    params: queryParams
  });
}

/**
 * 获取字典类型表单数据
 *
 * @param id
 */
export function getDictTypeForm(id: number): AxiosPromise<DictTypeForm> {
  return request({
    url: '/api/v1/dict/types/' + id + '/form',
    method: 'get'
  });
}

/**
 * 新增字典类型
 *
 * @param data
 */
export function addDictType(data: DictTypeForm) {
  return request({
    url: '/api/v1/dict/types',
    method: 'post',
    data: data
  });
}

/**
 * 修改字典类型
 *
 * @param id
 * @param data
 */
export function updateDictType(id: number, data: DictTypeForm) {
  return request({
    url: '/api/v1/dict/types/' + id,
    method: 'put',
    data: data
  });
}

/**
 * 删除字典类型
 */
export function deleteDictTypes(ids: string) {
  return request({
    url: '/api/v1/dict/types/' + ids,
    method: 'delete'
  });
}

/**
 * 获取字典类型的数据项
 *
 * @param typeCode 字典类型编码
 */
export function listDictItemsByTypeCode(
  typeCode: string
): AxiosPromise<OptionType[]> {
  return request({
    url: '/api/v1/dict/types/' + typeCode + '/items',
    method: 'get'
  });
}

/**
 * 获取字典项分页列表
 */
export function listDictItemPages(
  queryParams: DictItemQuery
): AxiosPromise<DictItemPageResult> {
  return request({
    url: '/api/v1/dict/items/pages',
    method: 'get',
    params: queryParams
  });
}

/**
 * 获取字典数据项表单数据
 *
 * @param id
 */
export function getDictItemData(id: number): AxiosPromise<DictItemForm> {
  return request({
    url: '/api/v1/dict/items/' + id + '/form',
    method: 'get'
  });
}

/**
 * 新增字典项
 *
 * @param data
 */
export function saveDictItem(data: DictItemForm) {
  return request({
    url: '/api/v1/dict/items',
    method: 'post',
    data: data
  });
}

/**
 * 修改字典项
 *
 * @param id
 * @param data
 */
export function updateDictItem(id: number, data: DictItemForm) {
  return request({
    url: '/api/v1/dict/items/' + id,
    method: 'put',
    data: data
  });
}

/**
 * 批量删除字典数据项
 *
 * @param ids 字典项ID，多个以英文逗号(,)分割
 */
export function deleteDictItems(ids: string) {
  return request({
    url: '/api/v1/dict/items/' + ids,
    method: 'delete'
  });
}
