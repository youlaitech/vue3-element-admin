import { PageQueryParam, PageResult } from '../base';

/**
 * 会员查询参数类型声明
 */
export interface MemberQueryParam extends PageQueryParam {
  nickName?: string;
}

/**
 * 会员分页列表项声明
 */
export interface MemberItem {
  id: string;
  gender: number;
  nickName: string;
  mobile: string;
  birthday?: any;
  avatarUrl: string;
  openid: string;
  sessionKey?: any;
  city: string;
  country: string;
  language: string;
  province: string;
  status: number;
  balance: string;
  deleted: number;
  point: number;
  addressList: AddressItem[];
}

export interface AddressItem {
  id: string;
  memberId: string;
  consigneeName: string;
  consigneeMobile: string;
  province: string;
  city: string;
  area: string;
  detailAddress: string;
  zipCode?: any;
  defaulted: number;
}

/**
 * 会员分页项类型声明
 */
export type MemberPageResult = PageResult<MemberItem[]>;

/**
 * 会员表单类型声明
 */
export interface MemberFormData {
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
