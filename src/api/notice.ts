import request from "@/utils/request";

const NOTICE_BASE_URL = "/api/v1/notices";

class NoticeAPI {
  /** 获取通知公告分页数据 */
  static getPage(queryParams?: NoticePageQuery) {
    return request<any, PageResult<NoticePageVO[]>>({
      url: `${NOTICE_BASE_URL}/page`,
      method: "get",
      params: queryParams,
    });
  }

  /**
   * 获取通知公告表单数据
   *
   * @param id NoticeID
   * @returns Notice表单数据
   */
  static getFormData(id: number) {
    return request<any, NoticeForm>({
      url: `${NOTICE_BASE_URL}/${id}/form`,
      method: "get",
    });
  }

  /** 添加通知公告*/
  static add(data: NoticeForm) {
    return request({
      url: `${NOTICE_BASE_URL}`,
      method: "post",
      data: data,
    });
  }

  /**
   * 更新通知公告
   *
   * @param id NoticeID
   * @param data Notice表单数据
   */
  static update(id: number, data: NoticeForm) {
    return request({
      url: `${NOTICE_BASE_URL}/${id}`,
      method: "put",
      data: data,
    });
  }

  /**
   * 批量删除通知公告，多个以英文逗号(,)分割
   *
   * @param ids 通知公告ID字符串，多个以英文逗号(,)分割
   */
  static deleteByIds(ids: string) {
    return request({
      url: `${NOTICE_BASE_URL}/${ids}`,
      method: "delete",
    });
  }
}

export default NoticeAPI;

/** 通知公告分页查询参数 */
export interface NoticePageQuery extends PageQuery {
  id?: bigint;
  /** 通知标题 */
  title?: string;
  /** 通知内容 */
  content?: string;
  /** 通知类型 */
  noticeType?: number;
  /** 发布人 */
  releaseBy?: bigint;
  /** 优先级(0-低 1-中 2-高) */
  priority?: number;
  /** 目标类型(0-全体 1-指定) */
  tarType?: number;
  /** 发布状态(0-未发布 1已发布 2已撤回) */
  sendStatus?: number;
  /** 发布时间 */
  sendTime?: [string, string];
  /** 撤回时间 */
  recallTime?: [string, string];
  /** 创建时间 */
  createTime?: Date;
  /** 更新时间 */
  updateTime?: Date;
}

/** 通知公告表单对象 */
export interface NoticeForm {
  id?: bigint;
  /** 通知标题 */
  title?: string;
  /** 通知内容 */
  content?: string;
  /** 通知类型 */
  noticeType?: number;
  /** 发布人 */
  releaseBy?: bigint;
  /** 优先级(0-低 1-中 2-高) */
  priority?: number;
  /** 目标类型(0-全体 1-指定) */
  tarType?: number;
  /** 发布状态(0-未发布 1已发布 2已撤回) */
  sendStatus?: number;
  /** 发布时间 */
  sendTime?: Date;
  /** 撤回时间 */
  recallTime?: Date;
}

/** 通知公告分页对象 */
export interface NoticePageVO {
  id?: bigint;
  /** 通知标题 */
  title?: string;
  /** 通知内容 */
  content?: string;
  /** 通知类型 */
  noticeType?: number;
  /** 发布人 */
  releaseBy?: bigint;
  /** 优先级(0-低 1-中 2-高) */
  priority?: number;
  /** 目标类型(0-全体 1-指定) */
  tarType?: number;
  /** 发布状态(0-未发布 1已发布 2已撤回) */
  sendStatus?: number;
  /** 发布时间 */
  sendTime?: Date;
  /** 撤回时间 */
  recallTime?: Date;
  /** 创建时间 */
  createTime?: Date;
  /** 更新时间 */
  updateTime?: Date;
}
