import request from "@/utils/request";

const NOTICE_BASE_URL = "/api/v1/notices";

const NoticeAPI = {
  /** 获取通知公告分页数据 */
  getPage(queryParams?: NoticePageQuery) {
    return request<any, PageResult<NoticePageVO[]>>({
      url: `${NOTICE_BASE_URL}/page`,
      method: "get",
      params: queryParams,
    });
  },

  /**
   * 获取通知公告表单数据
   *
   * @param id NoticeID
   * @returns Notice表单数据
   */
  getFormData(id: number) {
    return request<any, NoticeForm>({
      url: `${NOTICE_BASE_URL}/${id}/form`,
      method: "get",
    });
  },

  /**
   * 添加通知公告
   *
   * @param data Notice表单数据
   * @returns
   */
  add(data: NoticeForm) {
    return request({
      url: `${NOTICE_BASE_URL}`,
      method: "post",
      data: data,
    });
  },

  /**
   * 更新通知公告
   *
   * @param id NoticeID
   * @param data Notice表单数据
   */
  update(id: number, data: NoticeForm) {
    return request({
      url: `${NOTICE_BASE_URL}/${id}`,
      method: "put",
      data: data,
    });
  },

  /**
   * 批量删除通知公告，多个以英文逗号(,)分割
   *
   * @param ids 通知公告ID字符串，多个以英文逗号(,)分割
   */
  deleteByIds(ids: string) {
    return request({
      url: `${NOTICE_BASE_URL}/${ids}`,
      method: "delete",
    });
  },

  /**
   * 发布通知
   *
   * @param id 被发布的通知公告id
   * @returns
   */
  publish(id: number) {
    return request({
      url: `${NOTICE_BASE_URL}/${id}/publish`,
      method: "patch",
    });
  },

  /**
   * 撤回通知
   *
   * @param id 撤回的通知id
   * @returns
   */
  revoke(id: number) {
    return request({
      url: `${NOTICE_BASE_URL}/${id}/revoke`,
      method: "patch",
    });
  },
  /**
   * 查看通知
   *
   * @param id
   */
  getDetail(id: string) {
    return request<any, NoticeDetailVO>({
      url: `${NOTICE_BASE_URL}/${id}/detail`,
      method: "get",
    });
  },

  /* 全部已读 */
  readAll() {
    return request({
      url: `${NOTICE_BASE_URL}/read-all`,
      method: "put",
    });
  },

  /** 获取我的通知分页列表 */
  getMyNoticePage(queryParams?: NoticePageQuery) {
    return request<any, PageResult<NoticePageVO[]>>({
      url: `${NOTICE_BASE_URL}/my-page`,
      method: "get",
      params: queryParams,
    });
  },
};

export default NoticeAPI;

/** 通知公告分页查询参数 */
export interface NoticePageQuery extends PageQuery {
  /** 标题 */
  title?: string;
  /** 发布状态(0：未发布，1：已发布，-1：已撤回) */
  publishStatus?: number;

  isRead?: number;
}

/** 通知公告表单对象 */
export interface NoticeForm {
  id?: number;
  /** 通知标题 */
  title?: string;
  /** 通知内容 */
  content?: string;
  /** 通知类型 */
  type?: number;
  /** 优先级(L：低，M：中，H：高) */
  level?: string;
  /** 目标类型(1-全体 2-指定) */
  targetType?: number;
  /** 目标ID合集，以,分割 */
  targetUserIds?: string;
}

/** 通知公告分页对象 */
export interface NoticePageVO {
  id: string;
  /** 通知标题 */
  title?: string;
  /** 通知内容 */
  content?: string;
  /** 通知类型 */
  type?: number;
  /** 发布人 */
  publisherId?: bigint;
  /** 优先级(0-低 1-中 2-高) */
  priority?: number;
  /** 目标类型(0-全体 1-指定) */
  targetType?: number;
  /** 发布状态(0-未发布 1已发布 2已撤回) */
  publishStatus?: number;
  /** 发布时间 */
  publishTime?: Date;
  /** 撤回时间 */
  revokeTime?: Date;
}

export interface NoticeDetailVO {
  /** 通知ID */
  id?: string;

  /** 通知标题 */
  title?: string;

  /** 通知内容 */
  content?: string;

  /** 通知类型 */
  type?: number;

  /** 发布人 */
  publisherName?: string;

  /** 优先级(L-低 M-中 H-高) */
  level?: string;

  /** 发布时间 */
  publishTime?: Date;

  /** 发布状态 */
  publishStatus?: number;
}
