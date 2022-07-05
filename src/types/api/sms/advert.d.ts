import { PageQueryParam, PageResult } from '../base';

/**
 * 广告查询参数类型
 */
export interface AdvertQueryParam extends PageQueryParam {
  keywords: string;
}

/**
 * 广告分页列表项
 */
export interface AdvertItem {
  id: string;
  name: string;
  logoUrl: string;
  sort: number;
}

/**
 * 广告分页项类型
 */
export type AdvertPageResult = PageResult<AdvertItem[]>;

/**
 * 广告表单类型
 */
export interface AdvertFormData {
  id?: number;
  title: string;
  picUrl: string;
  beginTime: string;
  endTime: string;
  status: number;
  sort: number;
  url: string;
  remark: string;
}
