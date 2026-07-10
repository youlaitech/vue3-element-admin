import request from "@/utils/request";
import type { AppQueryParams, AppForm, AppItem } from "./types";
import type { PageResult } from "@/api/common";

const APP_BASE_URL = "/api/v1/apps";

const AppAPI = {
  /** 获取应用分页数据 */
  getPage(queryParams?: AppQueryParams) {
    return request<unknown, PageResult<AppItem>>({
      url: `${APP_BASE_URL}`,
      method: "get",
      params: queryParams,
    });
  },
  /** 获取应用表单数据 */
  getFormData(id: string) {
    return request<unknown, AppForm>({
      url: `${APP_BASE_URL}/${id}/form`,
      method: "get",
    });
  },
  /** 新增应用 */
  create(data: AppForm) {
    return request({ url: `${APP_BASE_URL}`, method: "post", data });
  },
  /** 修改应用 */
  update(id: string, data: AppForm) {
    return request({ url: `${APP_BASE_URL}/${id}`, method: "put", data });
  },
  /** 删除应用（多个 ID 以英文逗号分隔） */
  deleteByIds(ids: string) {
    return request({ url: `${APP_BASE_URL}/${ids}`, method: "delete" });
  },
  /** 修改应用状态 */
  updateStatus(id: string, status: number) {
    return request({ url: `${APP_BASE_URL}/${id}/status`, method: "put", data: { status } });
  },
};

export default AppAPI;

// 重导出类型
export * from "./types";
