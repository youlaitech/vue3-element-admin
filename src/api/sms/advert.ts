import {
  AdvertFormData,
  AdvertPageResult,
  AdvertQueryParam,
} from '@/types/api/sms/advert';
import request from '@/utils/request';
import { AxiosPromise } from 'axios';

/**
 * 获取广告分页列表
 *
 * @param queryParams
 */
export function listAdvertPages(
  queryParams: AdvertQueryParam
): AxiosPromise<AdvertPageResult> {
  return request({
    url: '/mall-sms/api/v1/adverts/pages',
    method: 'get',
    params: queryParams,
  });
}

/**
 * 获取广告详情
 *
 * @param id
 */
export function getAdvertFormDetail(id: number): AxiosPromise<AdvertFormData> {
  return request({
    url: '/mall-sms/api/v1/adverts/' + id,
    method: 'get',
  });
}

/**
 * 添加广告
 *
 * @param data
 */
export function addAdvert(data: AdvertFormData) {
  return request({
    url: '/mall-sms/api/v1/adverts',
    method: 'post',
    data: data,
  });
}

/**
 * 修改广告
 *
 * @param id
 * @param data
 */
export function updateAdvert(id: number, data: AdvertFormData) {
  return request({
    url: '/mall-sms/api/v1/adverts/' + id,
    method: 'put',
    data: data,
  });
}

/**
 * 删除广告
 *
 * @param ids
 */
export function deleteAdverts(ids: string) {
  return request({
    url: '/mall-sms/api/v1/adverts/' + ids,
    method: 'delete',
  });
}
