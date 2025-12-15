import request from "@/utils/request";

const STATISTICS_BASE_URL = "/api/v1/statistics";

const StatisticsAPI = {
  /** 获取访问趋势统计 */
  getVisitTrend(queryParams: VisitTrendQuery) {
    return request<any, VisitTrendVO>({
      url: `${STATISTICS_BASE_URL}/visits/trend`,
      method: "get",
      params: queryParams,
    });
  },
  /** 获取访问概览统计 */
  getVisitOverview() {
    return request<any, VisitStatsVO>({
      url: `${STATISTICS_BASE_URL}/visits/overview`,
      method: "get",
    });
  },
};

export default StatisticsAPI;

export interface VisitTrendQuery {
  /** 开始日期 */
  startDate: string;
  /** 结束日期 */
  endDate: string;
}

export interface VisitTrendVO {
  /** 日期列表 */
  dates: string[];
  /** 浏览量(PV) */
  pvList: number[];
  /** 访客数(UV) */
  uvList: number[];
  /** IP数 */
  ipList: number[];
}

export interface VisitStatsVO {
  /** 今日访客数(UV) */
  todayUvCount: number;
  /** 总访客数 */
  totalUvCount: number;
  /** 访客数同比增长率（相对于昨天同一时间段的增长率） */
  uvGrowthRate: number;
  /** 今日浏览量(PV) */
  todayPvCount: number;
  /** 总浏览量 */
  totalPvCount: number;
  /** 同比增长率（相对于昨天同一时间段的增长率） */
  pvGrowthRate: number;
}
