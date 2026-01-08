import request from "@/utils/request";
import type { VisitTrendQueryParams, VisitTrendDetail, VisitStatsDetail } from "@/types/api";

const STATISTICS_BASE_URL = "/api/v1/statistics";

const StatisticsAPI = {
  /** 获取访问趋势统计 */
  getVisitTrend(queryParams: VisitTrendQueryParams) {
    return request<any, VisitTrendDetail>({
      url: `${STATISTICS_BASE_URL}/visits/trend`,
      method: "get",
      params: queryParams,
    });
  },
  /** 获取访问概览统计 */
  getVisitOverview() {
    return request<any, VisitStatsDetail>({
      url: `${STATISTICS_BASE_URL}/visits/overview`,
      method: "get",
    });
  },
};

export default StatisticsAPI;
