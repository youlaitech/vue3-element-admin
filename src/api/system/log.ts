import request from "@/utils/request";
import type { LogPageQuery, LogPageVo } from "@/types/api";

const LOG_BASE_URL = "/api/v1/logs";

const LogAPI = {
  /** 获取日志分页列表 */
  getPage(queryParams: LogPageQuery) {
    return request<any, PageResult<LogPageVo[]>>({
      url: `${LOG_BASE_URL}/page`,
      method: "get",
      params: queryParams,
    });
  },
};

export default LogAPI;
