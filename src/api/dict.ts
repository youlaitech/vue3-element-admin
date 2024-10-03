import request from "@/utils/request";

const DICT_BASE_URL = "/api/v1/dict";

class DictAPI {
  /**
   * 获取字典分页列表
   *
   * @param queryParams 查询参数
   * @returns 字典分页结果
   */
  static getPage(queryParams: DictPageQuery) {
    return request<any, PageResult<DictPageVO[]>>({
      url: `${DICT_BASE_URL}/page`,
      method: "get",
      params: queryParams,
    });
  }

  /**
   * 获取字典表单数据
   *
   * @param id 字典ID
   * @returns 字典表单数据
   */
  static getFormData(id: number) {
    return request<any, ResponseData<DictForm>>({
      url: `${DICT_BASE_URL}/${id}/form`,
      method: "get",
    });
  }

  /**
   * 新增字典
   *
   * @param data 字典表单数据
   */
  static add(data: DictForm) {
    return request({
      url: `${DICT_BASE_URL}`,
      method: "post",
      data: data,
    });
  }

  /**
   * 修改字典
   *
   * @param id 字典ID
   * @param data 字典表单数据
   */
  static update(id: number, data: DictForm) {
    return request({
      url: `${DICT_BASE_URL}/${id}`,
      method: "put",
      data: data,
    });
  }

  /**
   * 删除字典
   *
   * @param ids 字典ID，多个以英文逗号(,)分隔
   */
  static deleteByIds(ids: string) {
    return request({
      url: `${DICT_BASE_URL}/${ids}`,
      method: "delete",
    });
  }

  /**
   * 获取字典列表
   *
   * @returns 字典列表
   */
  static getList() {
    return request<any, OptionType[]>({
      url: `${DICT_BASE_URL}/list`,
      method: "get",
    });
  }
}

export default DictAPI;

/**
 * 字典查询参数
 */
export interface DictPageQuery extends PageQuery {
  /**
   * 关键字(字典名称/编码)
   */
  keywords?: string;

  /**
   * 字典状态（1:启用，0:禁用）
   */
  status?: number;
}

/**
 * 字典分页对象
 */
export interface DictPageVO {
  /**
   * 字典ID
   */
  id: number;
  /**
   * 字典名称
   */
  name: string;
  /**
   * 字典编码
   */
  dictCode: string;
  /**
   * 字典状态（1:启用，0:禁用）
   */
  status: number;
}

/**
 * 字典
 */
export interface DictForm {
  /**
   * 字典ID
   */
  id?: number;
  /**
   * 字典名称
   */
  name?: string;
  /**
   * 字典编码
   */
  dictCode?: string;
  /**
   * 字典状态（1-启用，0-禁用）
   */
  status?: number;
  /**
   * 备注
   */
  remark?: string;
}
