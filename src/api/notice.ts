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

  /**
   * 添加通知公告
   * @param data Notice表单数据
   * @returns
   */
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

  /**
   * 发布通知
   *
   * @param id 被发布的通知公告id
   * @returns
   */
  static releaseNotice(id: number) {
    return request({
      url: `${NOTICE_BASE_URL}/release/${id}`,
      method: "patch",
    });
  }

  /**
   * 撤回通知
   *
   * @param id 撤回的通知id
   * @returns
   */
  static recallNotice(id: number): Promise<[]> {
    return request({
      url: `${NOTICE_BASE_URL}/recall/${id}`,
      method: "patch",
    });
  }

  /**
   * 获取未读消息
   * @returns 消息
   */
  static listUnreadNotice() {
    return request({
      url: `${NOTICE_BASE_URL}/unread`,
      method: "get",
    });
  }

  /**
   * 查看通知
   * @param id
   */
  static readNotice(id: number): Promise<NoticeDetailVO> {
    return request({
      url: `${NOTICE_BASE_URL}/read/${id}`,
      method: "PATCH",
    });
  }

  /**
   * 查看通知详情
   * @param id
   */
  static getDetail(id: number): Promise<NoticeDetailVO> {
    return request({
      url: `${NOTICE_BASE_URL}/detail/${id}`,
      method: "get",
    });
  }

  /**
   * 全部已读
   */
  static readAllNotice() {
    return request({
      url: `${NOTICE_BASE_URL}/readAll`,
      method: "PATCH",
    });
  }
}

export default NoticeAPI;

/** 通知公告分页查询参数 */
export interface NoticePageQuery extends PageQuery {
  /** 标题 */
  title?: string;
  /** 发布状态(0-未发布 1已发布 2已撤回) */
  sendStatus?: number;
}

/** 通知公告表单对象 */
export interface NoticeForm {
  id?: number;
  /** 通知标题 */
  title?: string;
  /** 通知内容 */
  content?: string;
  /** 通知类型 */
  noticeType?: number;
  /** 优先级(0-低 1-中 2-高) */
  priority?: number;
  /** 目标类型(0-全体 1-指定) */
  tarType?: number;
  /** 目标ID合集，以,分割 */
  tarIds?: string;
}

/** 通知公告分页对象 */
export interface NoticePageVO {
  id?: string;
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
  releaseStatus?: number;
  /** 发布时间 */
  releaseTime?: Date;
  /** 撤回时间 */
  recallTime?: Date;
}

export interface NoticeDetailVO {
  id?: string;
  /** 通知标题 */
  title?: string;
  /** 通知内容 */
  content?: string;
  /** 通知类型 */
  noticeTypeLabel?: number;
  /** 发布人 */
  releaseBy?: string;
  /** 优先级(0-低 1-中 2-高) */
  priority?: number;
  /** 发布时间 */
  releaseTime?: Date;
}
