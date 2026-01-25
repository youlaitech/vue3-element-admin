import request from "@/utils/request";
import type { OptionItem, PageResult } from "@/types/api";
import type {
  TenantPlanForm,
  TenantPlanItem,
  TenantPlanQueryParams,
} from "@/types/api/tenant-plan";

const TENANT_PLAN_BASE_URL = "/api/v1/tenant-plans";

const TenantPlanAPI = {
  /** 获取租户套餐分页数据 */
  getPage(queryParams?: TenantPlanQueryParams) {
    return request<any, PageResult<TenantPlanItem>>({
      url: `${TENANT_PLAN_BASE_URL}`,
      method: "get",
      params: queryParams,
    });
  },

  /** 获取租户套餐表单数据 */
  getFormData(planId: string) {
    return request<any, TenantPlanForm>({
      url: `${TENANT_PLAN_BASE_URL}/${planId}/form`,
      method: "get",
    });
  },

  /** 新增租户套餐 */
  create(data: TenantPlanForm) {
    return request({ url: `${TENANT_PLAN_BASE_URL}`, method: "post", data });
  },

  /** 修改租户套餐 */
  update(planId: string, data: TenantPlanForm) {
    return request({ url: `${TENANT_PLAN_BASE_URL}/${planId}`, method: "put", data });
  },

  /** 删除租户套餐 */
  deleteByIds(ids: string) {
    return request({ url: `${TENANT_PLAN_BASE_URL}/${ids}`, method: "delete" });
  },

  /** 获取租户方案下拉选项 */
  getOptions() {
    return request<any, OptionItem[]>({
      url: `${TENANT_PLAN_BASE_URL}/options`,
      method: "get",
    });
  },

  /** 获取方案菜单ID集合 */
  getPlanMenuIds(planId: number) {
    return request<any, number[]>({
      url: `${TENANT_PLAN_BASE_URL}/${planId}/menuIds`,
      method: "get",
    });
  },

  /** 更新方案菜单 */
  updatePlanMenus(planId: number, menuIds: number[]) {
    return request({
      url: `${TENANT_PLAN_BASE_URL}/${planId}/menus`,
      method: "put",
      data: menuIds,
    });
  },
};

export default TenantPlanAPI;
