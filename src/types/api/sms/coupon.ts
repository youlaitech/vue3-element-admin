import { PageQueryParam ,PageResult} from '../base';

/**
 * 优惠券查询参数类型
 */
export interface CouponQueryParam extends PageQueryParam {
  status?: number;
}

/**
 * 优惠券分页列表项
 */
 export interface CouponItem {
  id: string;
  name: string;
  type: string;
}

/**
 *优惠券分页项类型
 */
export type CouponPageResult = PageResult<CouponItem[]>;



/**
 * 广告表单类型声明
 */
 export interface CouponFormData {
  id?: number;
  name: string;
  type: string;
}
