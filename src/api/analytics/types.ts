/**
 * 访问汇总
 */
export interface VisitSummary {
  /** 今日访客数 */
  todayUv: number;
  /** 昨日访客数 */
  yesterdayUv: number;
  /** 累计访客数 */
  totalUv: number;
  /** 今日浏览量 */
  todayPv: number;
  /** 昨日浏览量 */
  yesterdayPv: number;
  /** 累计浏览量 */
  totalPv: number;
  /** 访客增长率；昨日为 0 时为 null */
  uvGrowthRate: number | null;
  /** 浏览量增长率；昨日为 0 时为 null */
  pvGrowthRate: number | null;
}

/**
 * 单日访问量
 */
export interface VisitTrendPoint {
  /** 日期 yyyy-MM-dd */
  date: string;
  /** 浏览量 */
  pv: number;
  /** 访客数 */
  uv: number;
}

/**
 * 访问趋势查询参数
 */
export interface VisitTrendQuery {
  /** 开始日期 yyyy-MM-dd */
  startDate: string;
  /** 结束日期 yyyy-MM-dd */
  endDate: string;
}

/**
 * 访问趋势
 */
export interface VisitTrend {
  /** 查询开始日期 */
  startDate: string;
  /** 查询结束日期 */
  endDate: string;
  /** 逐日访问量 */
  points: VisitTrendPoint[];
}

/**
 * 用户汇总
 */
export interface UserSummary {
  /** 用户总数 */
  total: number;
}
