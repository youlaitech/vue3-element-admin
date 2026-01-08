import request from "@/utils/request";
import type { DeptQueryParams, DeptItem, DeptForm, OptionItem } from "@/types/api";

const DEPT_BASE_URL = "/api/v1/depts";

const DeptAPI = {
  /** 获取部门树形列表 */
  getList(queryParams?: DeptQueryParams) {
    return request<any, DeptItem[]>({
      url: `${DEPT_BASE_URL}`,
      method: "get",
      params: queryParams,
    });
  },
  /** 获取部门下拉数据源 */
  getOptions() {
    return request<any, OptionItem[]>({ url: `${DEPT_BASE_URL}/options`, method: "get" });
  },
  /** 获取部门表单数据 */
  getFormData(id: string) {
    return request<any, DeptForm>({ url: `${DEPT_BASE_URL}/${id}/form`, method: "get" });
  },
  /** 新增部门 */
  create(data: DeptForm) {
    return request({ url: `${DEPT_BASE_URL}`, method: "post", data });
  },
  /** 修改部门 */
  update(id: string, data: DeptForm) {
    return request({ url: `${DEPT_BASE_URL}/${id}`, method: "put", data });
  },
  /** 批量删除部门，多个以英文逗号(,)分割 */
  deleteByIds(ids: string) {
    return request({ url: `${DEPT_BASE_URL}/${ids}`, method: "delete" });
  },
};

export default DeptAPI;
