import request from "@/utils/request";
import { MenuQuery, MenuVO, MenuForm, RouteVO } from "./model";

const MENU_BASE_URL = "/api/v1/menus";

class MenuAPI {
  /**
   * 获取路由列表
   *
   * @returns 路由列表
   */
  static getRoutes() {
    return request<any, RouteVO[]>({
      url: `${MENU_BASE_URL}/routes`,
      method: "get",
    });
  }

  /**
   * 获取菜单树形列表
   *
   * @param queryParams 查询参数
   * @returns 菜单树形列表
   */
  static getList(queryParams: MenuQuery) {
    return request<any, MenuVO[]>({
      url: `${MENU_BASE_URL}`,
      method: "get",
      params: queryParams,
    });
  }

  /**
   * 获取菜单下拉数据源
   *
   * @returns 菜单下拉数据源
   */
  static getOptions() {
    return request<any, OptionType[]>({
      url: `${MENU_BASE_URL}/options`,
      method: "get",
    });
  }

  /**
   * 获取菜单表单数据
   *
   * @param id 菜单ID
   * @returns 菜单表单数据
   */
  static getFormData(id: number) {
    return request<any, MenuForm>({
      url: `${MENU_BASE_URL}/${id}/form`,
      method: "get",
    });
  }

  /**
   * 添加菜单
   *
   * @param data 菜单表单数据
   * @returns 请求结果
   */
  static add(data: MenuForm) {
    return request({
      url: `${MENU_BASE_URL}`,
      method: "post",
      data: data,
    });
  }

  /**
   * 修改菜单
   *
   * @param id 菜单ID
   * @param data 菜单表单数据
   * @returns 请求结果
   */
  static update(id: string, data: MenuForm) {
    return request({
      url: `${MENU_BASE_URL}/${id}`,
      method: "put",
      data: data,
    });
  }

  /**
   * 删除菜单
   *
   * @param id 菜单ID
   * @returns 请求结果
   */
  static deleteById(id: number) {
    return request({
      url: `${MENU_BASE_URL}/${id}`,
      method: "delete",
    });
  }
}

export default MenuAPI;
