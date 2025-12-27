import request from "@/utils/request";
import type { VisitTrendQuery, VisitTrendVo, VisitStatsVo } from "@/types/api";

const STATISTICS_BASE_URL = "/api/v1/statistics";

const StatisticsAPI = {
  /** 获取访问趋势统计 */
  getVisitTrend(queryParams: VisitTrendQuery) {
    return request<any, VisitTrendVo>({
      url: `${STATISTICS_BASE_URL}/visits/trend`,
      method: "get",
      params: queryParams,
    });
  },
  /** 获取访问概览统计 */
  getVisitOverview() {
    return request<any, VisitStatsVo>({
      url: `${STATISTICS_BASE_URL}/visits/overview`,
      method: "get",
    });
  },
};

export default StatisticsAPI;
