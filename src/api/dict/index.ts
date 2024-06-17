import request from "@/utils/request";
import {
  DictTypeQuery,
  DictTypePageResult,
  DictTypeForm,
  DictQuery,
  DictForm,
  DictPageResult,
} from "./model";

const DICT_BASE_URL = "/api/v1/dict";

class DictAPI {
  /**
   * 获取字典类型分页列表
   *
   * @param queryParams 查询参数
   * @returns 字典类型分页结果
   */
  static getDictTypePage(queryParams: DictTypeQuery) {
    return request<any, DictTypePageResult>({
      url: `${DICT_BASE_URL}/types/page`,
      method: "get",
      params: queryParams,
    });
  }

  /**
   * 获取字典类型表单数据
   *
   * @param id 字典类型ID
   * @returns 字典类型表单数据
   */
  static getDictTypeForm(id: number) {
    return request<any, ResponseData<DictTypeForm>>({
      url: `${DICT_BASE_URL}/types/${id}/form`,
      method: "get",
    });
  }

  /**
   * 新增字典类型
   *
   * @param data 字典类型表单数据
   * @returns 请求结果
   */
  static addDictType(data: DictTypeForm) {
    return request({
      url: `${DICT_BASE_URL}/types`,
      method: "post",
      data: data,
    });
  }

  /**
   * 修改字典类型
   *
   * @param id 字典类型ID
   * @param data 字典类型表单数据
   * @returns 请求结果
   */
  static updateDictType(id: number, data: DictTypeForm) {
    return request({
      url: `${DICT_BASE_URL}/types/${id}`,
      method: "put",
      data: data,
    });
  }

  /**
   * 删除字典类型
   *
   * @param ids 字典类型ID，多个以英文逗号(,)分隔
   * @returns 请求结果
   */
  static deleteDictTypes(ids: string) {
    return request({
      url: `${DICT_BASE_URL}/types/${ids}`,
      method: "delete",
    });
  }

  /**
   * 获取字典类型的数据项
   *
   * @param typeCode 字典类型编码
   * @returns 字典类型的数据项
   */
  static getDictOptions(typeCode: string) {
    return request<any, OptionType[]>({
      url: `${DICT_BASE_URL}/${typeCode}/options`,
      method: "get",
    });
  }

  /**
   * 获取字典分页列表
   *
   * @param queryParams 查询参数
   * @returns 字典分页结果
   */
  static getDictPage(queryParams: DictQuery) {
    return request<any, DictPageResult>({
      url: `${DICT_BASE_URL}/page`,
      method: "get",
      params: queryParams,
    });
  }

  /**
   * 获取字典表单数据
   *
   * @param id 字典项ID
   * @returns 字典表单数据
   */
  static getDictFormData(id: number) {
    return request<any, DictForm>({
      url: `${DICT_BASE_URL}/${id}/form`,
      method: "get",
    });
  }

  /**
   * 新增字典
   *
   * @param data 字典表单数据
   * @returns 请求结果
   */
  static addDict(data: DictForm) {
    return request({
      url: `${DICT_BASE_URL}`,
      method: "post",
      data: data,
    });
  }

  /**
   * 修改字典项
   *
   * @param id 字典项ID
   * @param data 字典表单数据
   * @returns 请求结果
   */
  static updateDict(id: number, data: DictForm) {
    return request({
      url: `${DICT_BASE_URL}/${id}`,
      method: "put",
      data: data,
    });
  }

  /**
   * 删除字典
   *
   * @param ids 字典项ID，多个以英文逗号(,)分隔
   * @returns 请求结果
   */
  static deleteDictByIds(ids: string) {
    return request({
      url: `${DICT_BASE_URL}/${ids}`,
      method: "delete",
    });
  }
}

export default DictAPI;
