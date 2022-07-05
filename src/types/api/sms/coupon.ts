import { PageQueryParam, PageResult } from '../base';
import { Option } from '@/types/common';

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
   *  优惠券面值
   */
  faceValue: number;
  /**
   * 优惠券折扣
   */
  discount: number;
  /**
   * 发放数量
   */
  issueCount: number;
  /**
   * 使用门槛(0:无门槛)
   */
  minPoint: number;
  /**
   * 每人限领张数(-1:无限制)
   */
  perLimit: number;
  /**
   * 有效期类型(1:自领取之日起有效天数;2:有效起止时间)
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
   * 使用类型(0:全场通用;1:指定商品分类;2:指定商品)
   */
  useType: number;

  /**
   * 使用类型：指定商品分类
   */
  spuCategoryList: CouponSpuCategory[];

  /**
   * 使用类型：指定商品
   */
  spuList: CouponSpu[];

  /**
   * 使用说明
   */
  remark: string;
}

export interface CouponSpuCategory {
  id: number;
  categoryId: number;
  categoryName: string;
}

export interface CouponSpu {
  id: number;
  spuId: number;
  spuName: string;
}
