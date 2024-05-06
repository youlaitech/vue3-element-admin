import request from "@/utils/request";
import {
  DictTypeQuery,
  DictTypePageResult,
  DictTypeForm,
  DictQuery,
  DictForm,
  DictPageResult,
} from "./model";

class DictAPI {
  /**
   * 字典类型分页列表
   *
   * @param queryParams
   */
  static getDictTypePage(queryParams: DictTypeQuery) {
    return request<any, DictTypePageResult>({
      url: "/api/v1/dict/types/page",
      method: "get",
      params: queryParams,
    });
  }

  /**
   * 字典类型表单数据
   *
   * @param id
   */
  static getDictTypeForm(id: number) {
    return request<any, ResponseData<DictTypeForm>>({
      url: "/api/v1/dict/types/" + id + "/form",
      method: "get",
    });
  }

  /**
   * 新增字典类型
   *
   * @param data
   */
  static addDictType(data: DictTypeForm) {
    return request({
      url: "/api/v1/dict/types",
      method: "post",
      data: data,
    });
  }

  /**
   * 修改字典类型
   *
   * @param id
   * @param data
   */
  static updateDictType(id: number, data: DictTypeForm) {
    return request({
      url: "/api/v1/dict/types/" + id,
      method: "put",
      data: data,
    });
  }

  /**
   * 删除字典类型
   */
  static deleteDictTypes(ids: string) {
    return request({
      url: "/api/v1/dict/types/" + ids,
      method: "delete",
    });
  }

  /**
   * 获取字典类型的数据项
   *
   * @param typeCode 字典类型编码
   */
  static getDictOptions(typeCode: string) {
    return request<any, OptionType[]>({
      url: "/api/v1/dict/" + typeCode + "/options",
      method: "get",
    });
  }

  /**
   * 字典分页列表
   */
  static getDictPage(queryParams: DictQuery) {
    return request<any, DictPageResult>({
      url: "/api/v1/dict/page",
      method: "get",
      params: queryParams,
    });
  }

  /**
   * 获取字典表单数据
   *
   * @param id
   */
  static getDictFormData(id: number) {
    return request<any, DictForm>({
      url: "/api/v1/dict/" + id + "/form",
      method: "get",
    });
  }

  /**
   * 新增字典
   *
   * @param data
   */
  static addDict(data: DictForm) {
    return request({
      url: "/api/v1/dict",
      method: "post",
      data: data,
    });
  }

  /**
   * 修改字典项
   *
   * @param id
   * @param data
   */
  static updateDict(id: number, data: DictForm) {
    return request({
      url: "/api/v1/dict/" + id,
      method: "put",
      data: data,
    });
  }

  /**
   * 删除字典
   *
   * @param ids 字典项ID，多个以英文逗号(,)分割
   */
  static deleteDictByIds(ids: string) {
    return request({
      url: "/api/v1/dict/" + ids,
      method: "delete",
    });
  }
}

export default DictAPI;
