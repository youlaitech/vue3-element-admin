import { PageQueryParam, PageResult } from '../base';

/**
 * 优惠券查询参数类型
 */
export interface CouponQueryParam extends PageQueryParam {
  status?: number;
  keywords?: string;
}

/**
 * 优惠券分页列表项
 */
export interface CouponItem {
  id: string;
  name: string;
  code: string;
  platformLabel: string;
  typeLabel: string;
  faceValueLabel: string;
  validityPeriodLabel: string;
}

/**
 *优惠券分页
 */
export type CouponPageResult = PageResult<CouponItem[]>;

/**
 * 优惠券表单类型
 */
export interface CouponFormData {
  /**
   * ID
   */
  id?: number;
  /**
   * 优惠券名称
   */
  name: string;
  /**
   * 优惠券码
   */
  code: string;
  /**
   * 使用平台(0:全平台;1:移动端;2:PC;)
   */
  platform: number;
  /**
   * 优惠券类型(1:满减券;2:直减券;3:折扣券)
   */
  type: number;

  /**
   *  优惠券面值类型
   */
  faceValueType: number;
  /**
   *  优惠券面值
   */
  faceValue: number;
  /**
   * 优惠券折扣
   */
  discount: number;
  /**
   * 发行量
   */
  circulation: number;
  /**
   * 使用门槛(0:无门槛)
   */
  minPoint: number;
  /**
   * 每人限领张数(-1:无限制)
   */
  perLimit: number;
  /**
   * 有效期类型(1:日期范围;2:固定天数)
   */
  validityPeriodType: number;
  /**
   * 自领取之日起有效天数
   */
  validityDays: number;
  /**
   * 有效期起始时间
   */
  validityBeginTime: string;
  /**
   * 有效期截止时间
   */
  validityEndTime: string;
  /**
   * 应用范围(0:全场通用;1:指定商品分类;2:指定商品)
   */
  applicationScope: number;

  /**
   * 使用类型：指定商品分类
   */
  spuCategoryIds: number[];

  /**
   * 使用类型：指定商品
   */
  spuIds: number[];

  /**
   * 使用说明
   */
  remark: string;
}
