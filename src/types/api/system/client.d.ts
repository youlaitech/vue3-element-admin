import { PageQueryParam, PageResult } from '../base';

/**
 * 客户端查询参数类型
 */
export interface ClientQueryParam extends PageQueryParam {
  keywords?: string;
}

/**
 * 客户端分页列表项
 */
export interface ClientItem {
  clientId: string;
  clientSecret: string;
  resourceIds: string;
  scope: string;
  authorizedGrantTypes: string;
  webServerRedirectUri?: any;
  authorities?: any;
  accessTokenValidity: number;
  refreshTokenValidity: number;
  additionalInformation?: any;
  autoapprove: string;
}

/**
 * 客户端分页项类型
 */
export type ClientPageResult = PageResult<ClientItem[]>;

/**
 * 客户端表单类型
 */
export interface ClientFormData {
  authorizedGrantTypes: string;
  clientId: string;
  clientSecret: string;
  accessTokenValidity: string;
  refreshTokenValidity: string;
  webServerRedirectUri: string;
  authorities: string;
  additionalInformation: string;
  autoapprove: string;
  scope: string;
}
