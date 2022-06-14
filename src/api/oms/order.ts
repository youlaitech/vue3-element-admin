import { OrderPageResult, OrderQueryParam } from '@/types/api/oms/order';
import request from '@/utils/request';
import { AxiosPromise } from 'axios';

/**
 * 获取订单分页列表
 *
 * @param queryParams
 */
export function listOrderPages(
  queryParams: OrderQueryParam
): AxiosPromise<OrderPageResult> {
  return request({
    url: '/mall-oms/api/v1/orders',
    method: 'get',
    params: queryParams,
  });
}

/**
 * 获取订单详情
 *
 * @param orderId
 */
export function getOrderDetail(orderId: number) {
  return request({
    url: '/mall-oms/api/v1/orders/' + orderId,
    method: 'get',
  });
}
