import { GoodsDetail, GoodsPageResult, GoodsQueryParam } from '@/types';
import request from '@/utils/request';
import { AxiosPromise } from 'axios';

/**
 * 获取商品分页列表
 *
 * @param queryParams
 */
export function listGoodsPages(
  queryParams: GoodsQueryParam
): AxiosPromise<GoodsPageResult> {
  return request({
    url: '/mall-pms/api/v1/goods/page',
    method: 'get',
    params: queryParams
  });
}

/**
 * 获取商品详情
 *
 * @param id
 */
export function getGoodsDetail(id: string): AxiosPromise<GoodsDetail> {
  return request({
    url: '/mall-pms/api/v1/goods/' + id,
    method: 'get'
  });
}

/**
 * 添加商品
 *
 * @param data
 */
export function addGoods(data: object) {
  return request({
    url: '/mall-pms/api/v1/goods',
    method: 'post',
    data: data
  });
}

/**
 * 修改商品
 *
 * @param id
 * @param data
 */
export function updateGoods(id: number, data: object) {
  return request({
    url: '/mall-pms/api/v1/goods/' + id,
    method: 'put',
    data: data
  });
}

/**
 * 删除商品
 *
 * @param ids
 */
export function deleteGoods(ids: string) {
  return request({
    url: '/mall-pms/api/v1/goods/' + ids,
    method: 'delete'
  });
}
