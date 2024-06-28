import request from "@/utils/request";

const LOG_BASE_URL = "/api/v1/logs";

class LogAPI {
  /**
   * 获取日志分页列表
   *
   * @param queryParams 查询参数
   */
  static getPage(queryParams: LogPageQuery) {
    return request<any, PageResult<LogPageVO[]>>({
      url: `${LOG_BASE_URL}/page`,
      method: "get",
      params: queryParams,
    });
  }
}

export default LogAPI;

/**
 * 日志分页查询对象
 */
export interface LogPageQuery extends PageQuery {
  /** 搜索关键字 */
  keywords?: string;
}

/**
 * 系统日志分页VO
 */
export interface LogPageVO {
  /** 主键 */
  id: number;
  /** 日志模块 */
  module: string;
  /** 日志内容 */
  content: string;
  /** 请求路径 */
  requestUri: string;
  /** 请求方法 */
  method: string;
  /** IP 地址 */
  ip: string;
  /** 地区 */
  region: string;
  /** 浏览器 */
  browser: string;
  /** 终端系统 */
  os: string;
  /** 执行时间(毫秒) */
  executionTime: number;
  /** 操作人 */
  operator: string;
}
