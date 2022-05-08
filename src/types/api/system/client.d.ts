import { PageQueryParam, PageResult } from '../base';

/**
 * 客户端查询参数类型声明
 */
export interface ClientQueryParam extends PageQueryParam {
  /**
   * 客户端名称
   */
  clientId: string | undefined;
}

/**
 * 客户端分页列表项声明
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
 * 客户端分页项类型声明
 */
export type ClientPageResult = PageResult<ClientItem[]>;

/**
 * 客户端表单类型声明
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
