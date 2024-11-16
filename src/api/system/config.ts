import request from "@/utils/request";

const CONFIG_BASE_URL = "/api/v1/config";

const ConfigAPI = {
  /** 获取系统配置分页数据 */
  getPage(queryParams?: ConfigPageQuery) {
    return request<any, PageResult<ConfigPageVO[]>>({
      url: `${CONFIG_BASE_URL}/page`,
      method: "get",
      params: queryParams,
    });
  },
  /**
   * 获取系统配置表单数据
   *
   * @param id ConfigID
   * @returns Config表单数据
   */
  getFormData(id: number) {
    return request<any, ConfigForm>({
      url: `${CONFIG_BASE_URL}/${id}/form`,
      method: "get",
    });
  },

  /** 添加系统配置*/
  add(data: ConfigForm) {
    return request({
      url: `${CONFIG_BASE_URL}`,
      method: "post",
      data: data,
    });
  },

  /**
   * 更新系统配置
   *
   * @param id ConfigID
   * @param data Config表单数据
   */
  update(id: number, data: ConfigForm) {
    return request({
      url: `${CONFIG_BASE_URL}/${id}`,
      method: "put",
      data: data,
    });
  },

  /**
   * 删除系统配置
   *
   * @param ids 系统配置ID
   */
  deleteById(id: number) {
    return request({
      url: `${CONFIG_BASE_URL}/${id}`,
      method: "delete",
    });
  },

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
  id?: number;
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
  id?: number;
  /** 配置名称 */
  configName?: string;
  /** 配置键 */
  configKey?: string;
  /** 配置值 */
  configValue?: string;
  /** 描述、备注 */
  remark?: string;
}
