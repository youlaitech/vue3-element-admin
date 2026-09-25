import request from "@/utils/request";
import type { MenuQueryParams, MenuItem, MenuForm, MenuAiResult, RouteItem } from "./types";
import type { OptionItem } from "@/api/common";
import { MenuTypeEnum } from "@/enums";

const MENU_BASE_URL = "/api/v1/menus";

const MenuAPI = {
  /**
   * 获取当前用户的路由列表
   */
  getRoutes() {
    return request<unknown, RouteItem[]>({ url: `${MENU_BASE_URL}/routes`, method: "get" });
  },
  /**
   * 获取菜单树形列表
   */
  getList(queryParams: MenuQueryParams) {
    return request<unknown, MenuItem[]>({
      url: `${MENU_BASE_URL}`,
      method: "get",
      params: queryParams,
    });
  },
  /**
   * 获取菜单下拉数据源
   */
  getOptions(params?: { types?: MenuTypeEnum[]; scope?: number }) {
    return request<unknown, OptionItem[]>({
      url: `${MENU_BASE_URL}/options`,
      method: "get",
      params,
    });
  },
  /**
   * 获取可作为上级菜单的下拉数据源（按钮不能有子级，不返回）
   */
  getParentOptions() {
    return request<unknown, OptionItem[]>({
      url: `${MENU_BASE_URL}/options`,
      method: "get",
      params: { types: [MenuTypeEnum.CATALOG, MenuTypeEnum.MENU] },
    });
  },
  /**
   * AI 推断访问路径与权限标识（未开启 AI 时返回业务异常）
   */
  aiFill(data: { name: string; type?: string; parentId?: string }) {
    return request<unknown, MenuAiResult>({
      url: `${MENU_BASE_URL}/ai-fill`,
      method: "post",
      data,
    });
  },
  /**
   * 获取菜单表单数据
   */
  getFormData(id: string) {
    return request<unknown, MenuForm>({ url: `${MENU_BASE_URL}/${id}/form`, method: "get" });
  },
  /**
   * 新增菜单
   */
  create(data: MenuForm) {
    return request({ url: `${MENU_BASE_URL}`, method: "post", data });
  },
  /**
   * 修改菜单
   */
  update(id: string, data: MenuForm) {
    return request({ url: `${MENU_BASE_URL}/${id}`, method: "put", data });
  },
  /**
   * 删除菜单
   */
  deleteById(id: string) {
    return request({ url: `${MENU_BASE_URL}/${id}`, method: "delete" });
  },
};

export default MenuAPI;

// 重导出类型
export * from "./types";
