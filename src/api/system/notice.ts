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
  /** 获取通知公告表单数据 */
  getFormData(id: string) {
    return request<any, NoticeForm>({ url: `${NOTICE_BASE_URL}/${id}/form`, method: "get" });
  },
  /** 添加通知公告 */
  create(data: NoticeForm) {
    return request({ url: `${NOTICE_BASE_URL}`, method: "post", data });
  },
  /** 更新通知公告 */
  update(id: string, data: NoticeForm) {
    return request({ url: `${NOTICE_BASE_URL}/${id}`, method: "put", data });
  },
  /** 批量删除通知公告，多个以英文逗号(,)分割 */
  deleteByIds(ids: string) {
    return request({ url: `${NOTICE_BASE_URL}/${ids}`, method: "delete" });
  },
  /** 发布通知 */
  publish(id: string) {
    return request({ url: `${NOTICE_BASE_URL}/${id}/publish`, method: "put" });
  },
  /** 撤回通知 */
  revoke(id: string) {
    return request({ url: `${NOTICE_BASE_URL}/${id}/revoke`, method: "put" });
  },
  /** 查看通知 */
  getDetail(id: string) {
    return request<any, NoticeDetailVO>({ url: `${NOTICE_BASE_URL}/${id}/detail`, method: "get" });
  },
  /** 全部已读 */
  readAll() {
    return request({ url: `${NOTICE_BASE_URL}/read-all`, method: "put" });
  },
  /** 获取我的通知分页列表 */
  getMyNoticePage(queryParams?: NoticePageQuery) {
    return request<any, PageResult<NoticePageVO[]>>({
      url: `${NOTICE_BASE_URL}/my`,
      method: "get",
      params: queryParams,
    });
  },
};

export default NoticeAPI;

export interface NoticePageQuery extends PageQuery {
  /** 标题 */
  title?: string;
  /** 发布状态(0:草稿;1:已发布;2:已撤回) */
  publishStatus?: number;
  /** 是否已读(1:是;0:否) */
  isRead?: number;
}
export interface NoticeForm {
  /** 通知ID(新增不填) */
  id?: string;
  /** 标题 */
  title?: string;
  /** 内容 */
  content?: string;
  /** 类型 */
  type?: number;
  /** 优先级/级别 */
  level?: string;
  /** 目标类型 */
  targetType?: number;
  /** 目标用户ID(多个以英文逗号(,)分割) */
  targetUserIds?: string;
}
export interface NoticePageVO {
  /** 通知ID */
  id: string;
  /** 标题 */
  title?: string;
  /** 内容 */
  content?: string;
  /** 类型 */
  type?: number;
  /** 发布人ID */
  publisherId?: bigint;
  /** 优先级 */
  priority?: number;
  /** 目标类型 */
  targetType?: number;
  /** 发布状态 */
  publishStatus?: number;
  /** 发布时间 */
  publishTime?: Date;
  /** 撤回时间 */
  revokeTime?: Date;
}
export interface NoticeDetailVO {
  /** 通知ID */
  id?: string;
  /** 标题 */
  title?: string;
  /** 内容 */
  content?: string;
  /** 类型 */
  type?: number;
  /** 发布人名称 */
  publisherName?: string;
  /** 优先级/级别 */
  level?: string;
  /** 发布时间 */
  publishTime?: Date;
  /** 发布状态 */
  publishStatus?: number;
}
