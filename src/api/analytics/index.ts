import request from "@/utils/request";
import type { UserSummary, VisitSummary, VisitTrend, VisitTrendQuery } from "./types";

const ANALYTICS_BASE_URL = "/api/v1/analytics";

const AnalyticsAPI = {
  /**
   * 获取访问汇总
   */
  getVisitSummary() {
    return request<unknown, VisitSummary>({
      url: `${ANALYTICS_BASE_URL}/visits/summary`,
      method: "get",
    });
  },

  /**
   * 获取访问趋势
   */
  getVisitTrend(queryParams: VisitTrendQuery) {
    return request<unknown, VisitTrend>({
      url: `${ANALYTICS_BASE_URL}/visits/trend`,
      method: "get",
      params: queryParams,
    });
  },

  /**
   * 获取用户汇总
   */
  getUserSummary() {
    return request<unknown, UserSummary>({
      url: `${ANALYTICS_BASE_URL}/users/summary`,
      method: "get",
    });
  },
};

export default AnalyticsAPI;

export * from "./types";
