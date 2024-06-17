import request from "@/utils/request";
import { RoleQuery, RolePageResult, RoleForm } from "./model";

const ROLE_BASE_URL = "/api/v1/roles";

class RoleAPI {
  /**
   * 获取角色分页数据
   *
   * @param queryParams 查询参数
   * @returns 角色分页数据
   */
  static getPage(queryParams?: RoleQuery) {
    return request<any, RolePageResult>({
      url: `${ROLE_BASE_URL}/page`,
      method: "get",
      params: queryParams,
    });
  }

  /**
   * 获取角色下拉数据源
   *
   * @param queryParams 查询参数（可选）
   * @returns 角色下拉数据源
   */
  static getOptions(queryParams?: RoleQuery) {
    return request<any, OptionType[]>({
      url: `${ROLE_BASE_URL}/options`,
      method: "get",
      params: queryParams,
    });
  }

  /**
   * 获取角色的菜单ID集合
   *
   * @param roleId 角色ID
   * @returns 角色的菜单ID集合
   */
  static getRoleMenuIds(roleId: number) {
    return request<any, number[]>({
      url: `${ROLE_BASE_URL}/${roleId}/menuIds`,
      method: "get",
    });
  }

  /**
   * 分配菜单权限给角色
   *
   * @param roleId 角色ID
   * @param data 菜单ID集合
   * @returns 请求结果
   */
  static updateRoleMenus(roleId: number, data: number[]) {
    return request({
      url: `${ROLE_BASE_URL}/${roleId}/menus`,
      method: "put",
      data: data,
    });
  }

  /**
   * 获取角色表单数据
   *
   * @param id 角色ID
   * @returns 角色表单数据
   */
  static getFormData(id: number) {
    return request<any, RoleForm>({
      url: `${ROLE_BASE_URL}/${id}/form`,
      method: "get",
    });
  }

  /**
   * 添加角色
   *
   * @param data 角色表单数据
   * @returns 请求结果
   */
  static add(data: RoleForm) {
    return request({
      url: `${ROLE_BASE_URL}`,
      method: "post",
      data: data,
    });
  }

  /**
   * 更新角色
   *
   * @param id 角色ID
   * @param data 角色表单数据
   * @returns 请求结果
   */
  static update(id: number, data: RoleForm) {
    return request({
      url: `${ROLE_BASE_URL}/${id}`,
      method: "put",
      data: data,
    });
  }

  /**
   * 批量删除角色，多个以英文逗号(,)分割
   *
   * @param ids 角色ID字符串，多个以英文逗号(,)分割
   * @returns 请求结果
   */
  static deleteByIds(ids: string) {
    return request({
      url: `${ROLE_BASE_URL}/${ids}`,
      method: "delete",
    });
  }
}

export default RoleAPI;
