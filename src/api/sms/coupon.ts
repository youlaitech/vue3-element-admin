import {
  CouponQueryParam,
  CouponPageResult,
  CouponFormData,
} from '@/types/api/sms/coupon';
import request from '@/utils/request';
import { AxiosPromise } from 'axios';

/**
 * 获取优惠券分页列表
 *
 * @param queryParams
 */
export function lisCouponPages(
  queryParams: CouponQueryParam
): AxiosPromise<CouponPageResult> {
  return request({
    url: '/mall-sms/api/v1/coupons/pages',
    method: 'get',
    params: queryParams,
  });
}

/**
 * 获取优惠券表单数据
 *
 * @param id
 */
export function getCouponFormData(id: number): AxiosPromise<CouponFormData> {
  return request({
    url: '/mall-sms/api/v1/coupons/' + id + '/form_data',
    method: 'get',
  });
}

/**
 * 添加优惠券
 *
 * @param data
 */
export function addCoupon(data: CouponFormData) {
  return request({
    url: '/mall-sms/api/v1/coupons',
    method: 'post',
    data: data,
  });
}

/**
 * 修改优惠券
 *
 * @param id
 * @param data
 */
export function updateCoupon(id: number, data: CouponFormData) {
  return request({
    url: '/mall-sms/api/v1/coupons/' + id,
    method: 'put',
    data: data,
  });
}

/**
 * 删除优惠券
 *
 * @param ids
 */
export function deleteCoupons(ids: string) {
  return request({
    url: '/mall-sms/api/v1/coupons/' + ids,
    method: 'delete',
  });
}
