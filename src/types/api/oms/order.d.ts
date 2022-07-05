import { PageQueryParam, PageResult } from '../base';

/**
 * 订单查询参数类型声明
 */
export interface OrderQueryParam extends PageQueryParam {
  orderSn: string | undefined;
  status: number | undefined;
}

/**
 * 订单分页列表项声明
 */
export interface Order {
  id: string;
  orderSn: string;
  totalAmount: string;
  payAmount: string;
  payType: number;
  status: number;
  totalQuantity: number;
  createTime: string;
  memberId: string;
  sourceType: number;
  orderItems: OrderItem[];
}
export interface OrderItem {
  id: string;
  orderId: string;
  skuId: string;
  skuName: string;
  picUrl: string;
  price: string;
  count: number;
  totalAmount: number;
}

/**
 * 订单分页项类型声明
 */
export type OrderPageResult = PageResult<Order[]>;

/**
 * 订单表单类型声明
 */
export interface OrderDetail {
  id: number | undefined;
  title: string;
  picUrl: string;
  beginTime: string;
  endTime: string;
  status: number;
  sort: number;
  url: string;
  remark: string;
}
