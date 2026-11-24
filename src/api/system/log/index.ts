import request from "@/utils/request";
import type { LogQuery, LogItem } from "./types";
import type { PageResult } from "@/api/common";

const LOG_BASE_URL = "/api/v1/logs";

const LogAPI = {
  /**
   * 获取日志分页列表
   */
  getPage(queryParams: LogQuery) {
    return request<unknown, PageResult<LogItem>>({
      url: LOG_BASE_URL,
      method: "get",
      params: queryParams,
    });
  },
};

export default LogAPI;

export * from "./types";
