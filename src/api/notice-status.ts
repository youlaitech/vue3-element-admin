import request from "@/utils/request";

const NOTICESTATUS_BASE_URL = "/api/v1/noticeStatuss";

class NoticeStatusAPI {
  /** 获取用户公告状态分页数据 */
  static getPage(queryParams?: NoticeStatusPageQuery) {
    return request<any, PageResult<NoticeStatusPageVO[]>>({
      url: `${NOTICESTATUS_BASE_URL}/page`,
      method: "get",
      params: queryParams,
    });
  }

  /**
   * 获取用户公告状态表单数据
   *
   * @param id NoticeStatusID
   * @returns NoticeStatus表单数据
   */
  static getFormData(id: number) {
    return request<any, NoticeStatusForm>({
      url: `${NOTICESTATUS_BASE_URL}/${id}/form`,
      method: "get",
    });
  }

  /** 添加用户公告状态*/
  static add(data: NoticeStatusForm) {
    return request({
      url: `${NOTICESTATUS_BASE_URL}`,
      method: "post",
      data: data,
    });
  }

  /**
   * 更新用户公告状态
   *
   * @param id NoticeStatusID
   * @param data NoticeStatus表单数据
   */
  static update(id: number, data: NoticeStatusForm) {
    return request({
      url: `${NOTICESTATUS_BASE_URL}/${id}`,
      method: "put",
      data: data,
    });
  }

  /**
   * 批量删除用户公告状态，多个以英文逗号(,)分割
   *
   * @param ids 用户公告状态ID字符串，多个以英文逗号(,)分割
   */
  static deleteByIds(ids: string) {
    return request({
      url: `${NOTICESTATUS_BASE_URL}/${ids}`,
      method: "delete",
    });
  }
}

export default NoticeStatusAPI;

/** 用户公告状态分页查询参数 */
export interface NoticeStatusPageQuery extends PageQuery {}

/** 用户公告状态表单对象 */
export interface NoticeStatusForm {}

/** 用户公告状态分页对象 */
export interface NoticeStatusPageVO {}
