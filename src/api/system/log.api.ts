import request from "@/utils/request";

const LOG_BASE_URL = "/api/v1/logs";

const LogAPI = {
  /**
   * 获取日志分页列表
   *
   * @param queryParams 查询参数
   */
  getPage(queryParams: LogPageQuery) {
    return request<any, PageResult<LogPageVO[]>>({
      url: `${LOG_BASE_URL}/page`,
      method: "get",
      params: queryParams,
    });
  },

  /**
   * 获取访问趋势
   *
   * @param queryParams
   * @returns
   */
  getVisitTrend(queryParams: VisitTrendQuery) {
    return request<any, VisitTrendVO>({
      url: `${LOG_BASE_URL}/visit-trend`,
      method: "get",
      params: queryParams,
    });
  },

  /**
   * 获取访问统计
   *
   * @param queryParams
   * @returns
   */
  getVisitStats() {
    return request<any, VisitStatsVO>({
      url: `${LOG_BASE_URL}/visit-stats`,
      method: "get",
    });
  },
};

export default LogAPI;

/**
 * 日志分页查询对象
 */
export interface LogPageQuery extends PageQuery {
  /** 搜索关键字 */
  keywords?: string;
  /** 操作时间 */
  createTime?: [string, string];
}

/**
 * 系统日志分页VO
 */
export interface LogPageVO {
  /** 主键 */
  id: string;
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

/**  访问趋势视图对象 */
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

/** 访问趋势查询参数 */
export interface VisitTrendQuery {
  /** 开始日期 */
  startDate: string;
  /** 结束日期 */
  endDate: string;
}

/**  访问统计 */
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
