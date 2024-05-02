import request from "@/utils/request";
import type { RouteRecordRaw } from "vue-router";
import { MenuQuery, MenuVO, MenuForm } from "./types";

/**
 * 获取路由列表
 */
export function listRoutes() {
  return request<any, ResponseData<RouteRecordRaw[]>>({
    url: "/api/v1/menus/routes",
    method: "get",
  });
}

/**
 * 获取菜单树形列表
 *
 * @param queryParams
 */
export function listMenus(queryParams: MenuQuery) {
  return request<any, ResponseData<MenuVO[]>>({
    url: "/api/v1/menus",
    method: "get",
    params: queryParams,
  });
}

/**
 * 获取菜单下拉树形列表
 */
export function getMenuOptions() {
  return request<any, ResponseData<OptionType[]>>({
    url: "/api/v1/menus/options",
    method: "get",
  });
}

/**
 * 获取菜单表单数据
 *
 * @param id
 */
export function getMenuForm(id: number) {
  return request<any, ResponseData<MenuForm>>({
    url: "/api/v1/menus/" + id + "/form",
    method: "get",
  });
}

/**
 * 添加菜单
 *
 * @param data
 */
export function addMenu(data: MenuForm) {
  return request({
    url: "/api/v1/menus",
    method: "post",
    data: data,
  });
}

/**
 * 修改菜单
 *
 * @param id
 * @param data
 */
export function updateMenu(id: string, data: MenuForm) {
  return request({
    url: "/api/v1/menus/" + id,
    method: "put",
    data: data,
  });
}

/**
 * 删除菜单
 *
 * @param id 菜单ID
 */
export function deleteMenu(id: number) {
  return request({
    url: "/api/v1/menus/" + id,
    method: "delete",
  });
}
