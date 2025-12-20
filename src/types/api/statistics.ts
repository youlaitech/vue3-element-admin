/**
 * Statistics 统计类型定义
 */

/** 访问趋势查询参数 */
export interface VisitTrendQuery {
  /** 开始日期 */
  startDate: string;
  /** 结束日期 */
  endDate: string;
}

/** 访问趋势视图对象 */
export interface VisitTrendVo {
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
export interface VisitStatsVo {
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
