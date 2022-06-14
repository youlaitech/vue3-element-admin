import request from '@/utils/request';

/**
 * 获取商品属性列表
 *
 * @param params
 */
export function listAttributes(params: object) {
  return request({
    url: '/mall-pms/api/v1/attributes',
    method: 'get',
    params: params,
  });
}

/**
 * 批量修改商品属性
 *
 * @param data
 */
export function saveAttributeBatch(data: object) {
  return request({
    url: '/mall-pms/api/v1/attributes/batch',
    method: 'post',
    data: data,
  });
}
