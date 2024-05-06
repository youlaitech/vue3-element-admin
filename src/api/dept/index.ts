import request from "@/utils/request";
import { DeptForm, DeptQuery, DeptVO } from "./model";

class DeptAPI {
  /**
   * 部门树形表格
   *
   * @param queryParams
   */
  static getList(queryParams?: DeptQuery) {
    return request<any, DeptVO[]>({
      url: "/api/v1/dept",
      method: "get",
      params: queryParams,
    });
  }

  /**
   * 部门下拉列表
   */
  static getOptions() {
    return request<any, OptionType[]>({
      url: "/api/v1/dept/options",
      method: "get",
    });
  }

  /**
   * 获取部门详情
   *
   * @param id
   */
  static getFormData(id: number) {
    return request<any, DeptForm>({
      url: "/api/v1/dept/" + id + "/form",
      method: "get",
    });
  }

  /**
   * 新增部门
   *
   * @param data
   */
  static add(data: DeptForm) {
    return request({
      url: "/api/v1/dept",
      method: "post",
      data: data,
    });
  }

  /**
   *  修改部门
   *
   * @param id
   * @param data
   */
  static update(id: number, data: DeptForm) {
    return request({
      url: "/api/v1/dept/" + id,
      method: "put",
      data: data,
    });
  }

  /**
   * 删除部门
   *
   * @param ids
   */
  static deleteByIds(ids: string) {
    return request({
      url: "/api/v1/dept/" + ids,
      method: "delete",
    });
  }
}

export default DeptAPI;
