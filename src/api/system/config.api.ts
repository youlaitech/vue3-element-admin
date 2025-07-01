import request from "@/utils/request";

const CONFIG_BASE_URL = "/api/v1/config";

const ConfigAPI = {
  /** 系统配置分页 */
  getPage(queryParams?: ConfigPageQuery) {
    return request<any, PageResult<ConfigPageVO[]>>({
      url: `${CONFIG_BASE_URL}/page`,
      method: "get",
      params: queryParams,
    });
  },

  /** 系统配置表单数据 */
  getFormData(id: string) {
    return request<any, ConfigForm>({
      url: `${CONFIG_BASE_URL}/${id}/form`,
      method: "get",
    });
  },

  /** 新增系统配置 */
  create(data: ConfigForm) {
    return request({
      url: `${CONFIG_BASE_URL}`,
      method: "post",
      data,
    });
  },

  /** 更新系统配置 */
  update(id: string, data: ConfigForm) {
    return request({
      url: `${CONFIG_BASE_URL}/${id}`,
      method: "put",
      data,
    });
  },

  /**
   * 删除系统配置
   *
   * @param ids 系统配置ID
   */
  deleteById(id: string) {
    return request({
      url: `${CONFIG_BASE_URL}/${id}`,
      method: "delete",
    });
  },
  /** 刷新系统配置缓存 */
  refreshCache() {
    return request({
      url: `${CONFIG_BASE_URL}/refresh`,
      method: "PUT",
    });
  },
};

export default ConfigAPI;

/** $系统配置分页查询参数 */
export interface ConfigPageQuery extends PageQuery {
  /** 搜索关键字 */
  keywords?: string;
}

/** 系统配置表单对象 */
export interface ConfigForm {
  /** 主键 */
  id?: string;
  /** 配置名称 */
  configName?: string;
  /** 配置键 */
  configKey?: string;
  /** 配置值 */
  configValue?: string;
  /** 描述、备注 */
  remark?: string;
}

/** 系统配置分页对象 */
export interface ConfigPageVO {
  /** 主键 */
  id?: string;
  /** 配置名称 */
  configName?: string;
  /** 配置键 */
  configKey?: string;
  /** 配置值 */
  configValue?: string;
  /** 描述、备注 */
  remark?: string;
}
