import { PageQueryParam, PageResult } from '../base';

/**
 * 品牌查询参数类型声明
 */
export interface BrandQueryParam extends PageQueryParam {
  name?: string;
}

/**
 * 品牌分页列表项声明
 */
export interface BrandItem {
  id: string;
  name: string;
  logoUrl: string;
  sort: number;
}

/**
 * 品牌分页项类型声明
 */
export type BrandPageResult = PageResult<BrandItem[]>;

/**
 * 品牌表单类型声明
 */
export interface BrandFormData {
  id: number | undefined;
  name: string;
  logoUrl: string;
  sort: number;
}
