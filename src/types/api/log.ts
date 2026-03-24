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

/** 访问趋势查询参数 */
export interface VisitTrendQueryParams {
  /** 开始日期 */
  startDate: string;
  /** 结束日期 */
  endDate: string;
}

/** 访问趋势视图对象 */
export interface VisitTrendDetail {
  /** 日期列表 */
  dates: string[];
  /** 浏览量(PV)列表 */
  pvList: number[];
  /** 访客数(UV)列表 */
  uvList: number[];
  /** IP数列表 */
  ipList: number[];
}

/** 访问量统计视图对象 */
export interface VisitStatsDetail {
  /** 今日独立访客数(UV) */
  todayUvCount: number;
  /** 累计独立访客数(UV) */
  totalUvCount: number;
  /** 独立访客增长率 */
  uvGrowthRate: number;
  /** 今日页面浏览量(PV) */
  todayPvCount: number;
  /** 累计页面浏览量(PV) */
  totalPvCount: number;
  /** 页面浏览量增长率 */
  pvGrowthRate: number;
}
