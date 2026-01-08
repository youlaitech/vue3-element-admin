import request from "@/utils/request";
import type { ConfigQueryParams, ConfigForm, ConfigItem } from "@/types/api";

const CONFIG_BASE_URL = "/api/v1/configs";

const ConfigAPI = {
  /** 获取配置分页数据 */
  getPage(queryParams?: ConfigQueryParams) {
    return request<any, PageResult<ConfigItem>>({
      url: `${CONFIG_BASE_URL}`,
      method: "get",
      params: queryParams,
    });
  },
  /** 获取配置表单数据 */
  getFormData(id: string) {
    return request<any, ConfigForm>({
      url: `${CONFIG_BASE_URL}/${id}/form`,
      method: "get",
    });
  },
  /** 新增配置 */
  create(data: ConfigForm) {
    return request({ url: `${CONFIG_BASE_URL}`, method: "post", data });
  },
  /** 修改配置 */
  update(id: string, data: ConfigForm) {
    return request({ url: `${CONFIG_BASE_URL}/${id}`, method: "put", data });
  },
  /** 删除配置 */
  deleteById(id: string) {
    return request({ url: `${CONFIG_BASE_URL}/${id}`, method: "delete" });
  },
  /** 刷新配置缓存 */
  refreshCache() {
    return request({ url: `${CONFIG_BASE_URL}/refresh`, method: "PUT" });
  },
};

export default ConfigAPI;
