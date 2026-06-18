import request from "@/utils/request";
import type {
  LogQueryParams,
  LogItem,
  VisitTrendQueryParams,
  VisitTrendDetail,
  VisitOverviewDetail,
} from "./types";
import type { PageResult } from "@/api/common";

const LOG_BASE_URL = "/api/v1/logs";

const LogAPI = {
  /** 获取日志分页列表 */
  getPage(queryParams: LogQueryParams) {
    return request<unknown, PageResult<LogItem>>({
      url: `${LOG_BASE_URL}`,
      method: "get",
      params: queryParams,
    });
  },

  /** 获取访问趋势统计 */
  getVisitTrend(queryParams: VisitTrendQueryParams) {
    return request<unknown, VisitTrendDetail>({
      url: `${LOG_BASE_URL}/analytics/trend`,
      method: "get",
      params: queryParams,
    });
  },

  /** 获取访问概览统计 */
  getVisitOverview() {
    return request<unknown, VisitOverviewDetail>({
      url: `${LOG_BASE_URL}/analytics/overview`,
      method: "get",
    });
  },
};

export default LogAPI;

// 重导出类型
export * from "./types";
