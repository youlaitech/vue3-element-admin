import request from "@/utils/request";
import type {
  LogQueryParams,
  LogItem,
  VisitTrendQueryParams,
  VisitTrendDetail,
  VisitStatsDetail,
} from "@/types/api";

const LOG_BASE_URL = "/api/v1/logs";

const LogAPI = {
  /** 获取日志分页列表 */
  getPage(queryParams: LogQueryParams) {
    return request<any, PageResult<LogItem>>({
      url: `${LOG_BASE_URL}`,
      method: "get",
      params: queryParams,
    });
  },

  /** 获取访问趋势统计 */
  getVisitTrend(queryParams: VisitTrendQueryParams) {
    return request<any, VisitTrendDetail>({
      url: `${LOG_BASE_URL}/views/trend`,
      method: "get",
      params: queryParams,
    });
  },

  /** 获取访问概览统计 */
  getVisitOverview() {
    return request<any, VisitStatsDetail>({
      url: `${LOG_BASE_URL}/views`,
      method: "get",
    });
  },
};

export default LogAPI;
