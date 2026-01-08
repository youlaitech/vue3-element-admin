/**
 * Config 配置类型定义
 */

import type { BaseQueryParams } from "./common";

/** 配置分页查询参数 */
export interface ConfigQueryParams extends BaseQueryParams {
  /** 搜索关键字 */
  keywords?: string;
}

/** 配置表单对象 */
export interface ConfigForm {
  /** 配置ID */
  id?: string;
  /** 配置名称 */
  configName?: string;
  /** 配置键 */
  configKey?: string;
  /** 配置值 */
  configValue?: string;
  /** 备注 */
  remark?: string;
}

/** 配置分页对象 */
export interface ConfigItem {
  /** 配置ID */
  id?: string;
  /** 配置名称 */
  configName?: string;
  /** 配置键 */
  configKey?: string;
  /** 配置值 */
  configValue?: string;
}
