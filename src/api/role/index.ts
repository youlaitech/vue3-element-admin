import request from "@/utils/request";
import { RoleQuery, RolePageResult, RoleForm } from "./model";

class RoleAPI {
  /**
   * 获取角色分页数据
   *
   * @param queryParams
   */
  static getPage(queryParams?: RoleQuery) {
    return request<any, RolePageResult>({
      url: "/api/v1/roles/page",
      method: "get",
      params: queryParams,
    });
  }

  /**
   * 获取角色下拉数据源
   *
   * @param queryParams
   */
  static getOptions(queryParams?: RoleQuery) {
    return request<any, OptionType[]>({
      url: "/api/v1/roles/options",
      method: "get",
      params: queryParams,
    });
  }

  /**
   * 获取角色的菜单ID集合
   *
   * @param queryParams
   */
  static getRoleMenuIds(roleId: number) {
    return request<any, number[]>({
      url: "/api/v1/roles/" + roleId + "/menuIds",
      method: "get",
    });
  }

  /**
   * 分配菜单权限给角色
   *
   * @param queryParams
   */
  static updateRoleMenus(roleId: number, data: number[]) {
    return request({
      url: "/api/v1/roles/" + roleId + "/menus",
      method: "put",
      data: data,
    });
  }

  /**
   * 获取角色表单数据
   *
   * @param id
   */
  static getFormData(id: number) {
    return request<any, RoleForm>({
      url: "/api/v1/roles/" + id + "/form",
      method: "get",
    });
  }

  /**
   * 添加角色
   *
   * @param data
   */
  static add(data: RoleForm) {
    return request({
      url: "/api/v1/roles",
      method: "post",
      data: data,
    });
  }

  /**
   * 更新角色
   *
   * @param id
   * @param data
   */
  static update(id: number, data: RoleForm) {
    return request({
      url: "/api/v1/roles/" + id,
      method: "put",
      data: data,
    });
  }

  /**
   * 批量删除角色，多个以英文逗号(,)分割
   *
   * @param ids
   */
  static deleteByIds(ids: string) {
    return request({
      url: "/api/v1/roles/" + ids,
      method: "delete",
    });
  }
}

export default RoleAPI;
