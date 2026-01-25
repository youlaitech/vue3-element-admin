import request from "@/utils/request";
import type { MenuQueryParams, MenuItem, MenuForm, RouteItem, OptionItem } from "@/types/api";

const MENU_BASE_URL = "/api/v1/menus";

const MenuAPI = {
  /** 获取当前用户的路由列表 */
  getRoutes() {
    return request<any, RouteItem[]>({ url: `${MENU_BASE_URL}/routes`, method: "get" });
  },
  /** 获取菜单树形列表 */
  getList(queryParams: MenuQueryParams) {
    return request<any, MenuItem[]>({
      url: `${MENU_BASE_URL}`,
      method: "get",
      params: queryParams,
    });
  },
  /** 获取菜单下拉数据源 */
  getOptions(onlyParent?: boolean, scope?: number) {
    return request<any, OptionItem[]>({
      url: `${MENU_BASE_URL}/options`,
      method: "get",
      params: { onlyParent, scope },
    });
  },
  /** 获取菜单表单数据 */
  getFormData(id: string) {
    return request<any, MenuForm>({ url: `${MENU_BASE_URL}/${id}/form`, method: "get" });
  },
  /** 新增菜单 */
  create(data: MenuForm) {
    return request({ url: `${MENU_BASE_URL}`, method: "post", data });
  },
  /** 修改菜单 */
  update(id: string, data: MenuForm) {
    return request({ url: `${MENU_BASE_URL}/${id}`, method: "put", data });
  },
  /** 删除菜单 */
  deleteById(id: string) {
    return request({ url: `${MENU_BASE_URL}/${id}`, method: "delete" });
  },
};

export default MenuAPI;
