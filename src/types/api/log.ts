/**
 * Log 日志类型定义
 */

import type { BaseQueryParams } from "./common";

/** 日志分页查询参数 */
export interface LogQueryParams extends BaseQueryParams {
  /** 搜索关键字(IP/操作人) */
  keywords?: string;
  /** 操作时间 */
  createTime?: [string, string];
}

/** 日志分页对象 */
export interface LogItem {
  /** 日志ID */
  id: number;
  /** 模块 */
  module?: string;
  /** 操作类型 */
  actionType?: string;
  /** 操作标题 */
  title?: string;
  /** 自定义日志内容 */
  content?: string;
  /** 操作人ID */
  operatorId?: number;
  /** 操作人名称 */
  operatorName?: string;
  /** 请求路径 */
  requestUri?: string;
  /** 请求方法 */
  requestMethod?: string;
  /** IP地址 */
  ip?: string;
  /** 地区 */
  region?: string;
  /** 设备 */
  device?: string;
  /** 浏览器 */
  browser?: string;
  /** 操作系统 */
  os?: string;
  /** 状态：0失败 1成功 */
  status?: number;
  /** 执行时间(毫秒) */
  executionTime?: number;
  /** 错误信息 */
  errorMsg?: string;
  /** 操作时间 */
  createTime?: string;
}
