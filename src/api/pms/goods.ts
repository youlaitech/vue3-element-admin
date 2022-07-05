import {
  GoodsDetail,
  GoodsPageResult,
  GoodsQueryParam,
} from '@/types/api/pms/goods';
import request from '@/utils/request';
import { AxiosPromise } from 'axios';

/**
 * 获取商品分页列表
 *
 * @param queryParams
 */
export function listSpuPages(
  queryParams: GoodsQueryParam
): AxiosPromise<GoodsPageResult> {
  return request({
    url: '/mall-pms/api/v1/spu/pages',
    method: 'get',
    params: queryParams,
  });
}

/**
 * 获取商品详情
 *
 * @param id
 */
export function getSpuDetail(id: string): AxiosPromise<GoodsDetail> {
  return request({
    url: '/mall-pms/api/v1/spu/' + id,
    method: 'get',
  });
}

/**
 * 添加商品
 *
 * @param data
 */
export function addSpu(data: object) {
  return request({
    url: '/mall-pms/api/v1/spu',
    method: 'post',
    data: data,
  });
}

/**
 * 修改商品
 *
 * @param id
 * @param data
 */
export function updateSpu(id: number, data: object) {
  return request({
    url: '/mall-pms/api/v1/spu/' + id,
    method: 'put',
    data: data,
  });
}

/**
 * 删除商品
 *
 * @param ids
 */
export function deleteSpu(ids: string) {
  return request({
    url: '/mall-pms/api/v1/spu/' + ids,
    method: 'delete',
  });
}
