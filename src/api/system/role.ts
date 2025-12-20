import request from "@/utils/request";
import type { RolePageQuery, RolePageVo, RoleForm } from "@/types/api";

const ROLE_BASE_URL = "/api/v1/roles";

const RoleAPI = {
  /** 获取角色分页数据 */
  getPage(queryParams?: RolePageQuery) {
    return request<any, PageResult<RolePageVo[]>>({
      url: `${ROLE_BASE_URL}/page`,
      method: "get",
      params: queryParams,
    });
  },
  /** 获取角色下拉数据源 */
  getOptions() {
    return request<any, OptionType[]>({ url: `${ROLE_BASE_URL}/options`, method: "get" });
  },
  /** 获取角色的菜单ID集合 */
  getRoleMenuIds(roleId: string) {
    return request<any, string[]>({ url: `${ROLE_BASE_URL}/${roleId}/menuIds`, method: "get" });
  },
  /** 分配菜单权限 */
  updateRoleMenus(roleId: string, data: number[]) {
    return request({ url: `${ROLE_BASE_URL}/${roleId}/menus`, method: "put", data });
  },
  /** 获取角色表单数据 */
  getFormData(id: string) {
    return request<any, RoleForm>({ url: `${ROLE_BASE_URL}/${id}/form`, method: "get" });
  },
  /** 新增角色 */
  create(data: RoleForm) {
    return request({ url: `${ROLE_BASE_URL}`, method: "post", data });
  },
  /** 更新角色 */
  update(id: string, data: RoleForm) {
    return request({ url: `${ROLE_BASE_URL}/${id}`, method: "put", data });
  },
  /** 批量删除角色，多个以英文逗号(,)分割 */
  deleteByIds(ids: string) {
    return request({ url: `${ROLE_BASE_URL}/${ids}`, method: "delete" });
  },
};

export default RoleAPI;
