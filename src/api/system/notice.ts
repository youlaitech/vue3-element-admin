import request from "@/utils/request";
import type { NoticePageQuery, NoticeForm, NoticePageVo, NoticeDetailVo } from "@/types/api";

const NOTICE_BASE_URL = "/api/v1/notices";

const NoticeAPI = {
  /** 获取通知公告分页数据 */
  getPage(queryParams?: NoticePageQuery) {
    return request<any, PageResult<NoticePageVo[]>>({
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
    return request<any, NoticeDetailVo>({ url: `${NOTICE_BASE_URL}/${id}/detail`, method: "get" });
  },
  /** 全部已读 */
  readAll() {
    return request({ url: `${NOTICE_BASE_URL}/read-all`, method: "put" });
  },
  /** 获取我的通知分页列表 */
  getMyNoticePage(queryParams?: NoticePageQuery) {
    return request<any, PageResult<NoticePageVo[]>>({
      url: `${NOTICE_BASE_URL}/my`,
      method: "get",
      params: queryParams,
    });
  },
};

export default NoticeAPI;
