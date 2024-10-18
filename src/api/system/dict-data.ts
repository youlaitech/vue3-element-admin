import request from "@/utils/request";

const DICT_DATA_BASE_URL = "/api/v1/dict-data";

const DictDataAPI = {
  /**
   * 获取字典分页列表
   *
   * @param queryParams 查询参数
   * @returns 字典分页结果
   */
  getPage(queryParams: DictDataPageQuery) {
    return request<any, PageResult<DictDataPageVO[]>>({
      url: `${DICT_DATA_BASE_URL}/page`,
      method: "get",
      params: queryParams,
    });
  },

  /**
   * 获取字典数据表单
   *
   * @param id 字典ID
   * @returns 字典数据表单
   */
  getFormData(id: number) {
    return request<any, ResponseData<DictDataForm>>({
      url: `${DICT_DATA_BASE_URL}/${id}/form`,
      method: "get",
    });
  },

  /**
   * 新增字典数据
   *
   * @param data 字典数据
   */
  add(data: DictDataForm) {
    return request({
      url: `${DICT_DATA_BASE_URL}`,
      method: "post",
      data: data,
    });
  },

  /**
   * 修改字典数据
   *
   * @param id 字典ID
   * @param data 字典数据
   */
  update(id: number, data: DictDataForm) {
    return request({
      url: `${DICT_DATA_BASE_URL}/${id}`,
      method: "put",
      data: data,
    });
  },

  /**
   * 删除字典
   *
   * @param ids 字典ID，多个以英文逗号(,)分隔
   */
  deleteByIds(ids: string) {
    return request({
      url: `${DICT_DATA_BASE_URL}/${ids}`,
      method: "delete",
    });
  },

  /**
   * 获取字典的数据项
   *
   * @param dictCode 字典编码
   * @returns 字典数据项
   */
  getOptions(dictCode: string) {
    return request<any, OptionType[]>({
      url: `${DICT_DATA_BASE_URL}/${dictCode}/options`,
      method: "get",
    });
  },
};

export default DictDataAPI;

/**
 * 字典查询参数
 */
export interface DictDataPageQuery extends PageQuery {
  /** 关键字(字典数据值/标签) */
  keywords?: string;

  /** 字典编码 */
  dictCode?: string;
}

/**
 * 字典分页对象
 */
export interface DictDataPageVO {
  /**
   * 字典ID
   */
  id: number;
  /**
   * 字典编码
   */
  dictCode: string;
  /**
   * 字典数据值
   */
  value: string;
  /**
   * 字典数据标签
   */
  label: string;
  /**
   * 状态（1:启用，0:禁用)
   */
  status: number;
  /**
   * 字典排序
   */
  sort?: number;
}

/**
 * 字典
 */
export interface DictDataForm {
  /**
   * 字典ID
   */
  id?: number;
  /**
   * 字典编码
   */
  dictCode?: string;
  /**
   * 字典数据值
   */
  value?: string;
  /**
   * 字典数据标签
   */
  label?: string;
  /**
   * 状态（1:启用，0:禁用)
   */
  status?: number;
  /**
   * 字典排序
   */
  sort?: number;

  /**
   * 标签类型
   */
  tagType?: "success" | "warning" | "info" | "primary" | "danger" | undefined;
}
