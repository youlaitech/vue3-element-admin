import request from "@/utils/request";

const DICT_BASE_URL = "/api/v1/dicts";

const DictAPI = {
  /** 字典分页列表 */
  getPage(queryParams: DictPageQuery) {
    return request<any, PageResult<DictPageVO[]>>({
      url: `${DICT_BASE_URL}/page`,
      method: "get",
      params: queryParams,
    });
  },
  /** 字典列表 */
  getList() {
    return request<any, OptionType[]>({ url: `${DICT_BASE_URL}`, method: "get" });
  },
  /** 字典表单数据 */
  getFormData(id: string) {
    return request<any, DictForm>({ url: `${DICT_BASE_URL}/${id}/form`, method: "get" });
  },
  /** 新增字典 */
  create(data: DictForm) {
    return request({ url: `${DICT_BASE_URL}`, method: "post", data });
  },
  /** 修改字典 */
  update(id: string, data: DictForm) {
    return request({ url: `${DICT_BASE_URL}/${id}`, method: "put", data });
  },
  /** 删除字典 */
  deleteByIds(ids: string) {
    return request({ url: `${DICT_BASE_URL}/${ids}`, method: "delete" });
  },

  /** 获取字典项分页列表 */
  getDictItemPage(dictCode: string, queryParams: DictItemPageQuery) {
    return request<any, PageResult<DictItemPageVO[]>>({
      url: `${DICT_BASE_URL}/${dictCode}/items/page`,
      method: "get",
      params: queryParams,
    });
  },
  /** 获取字典项列表 */
  getDictItems(dictCode: string) {
    return request<any, DictItemOption[]>({
      url: `${DICT_BASE_URL}/${dictCode}/items`,
      method: "get",
    });
  },
  /** 新增字典项 */
  createDictItem(dictCode: string, data: DictItemForm) {
    return request({ url: `${DICT_BASE_URL}/${dictCode}/items`, method: "post", data });
  },
  /** 获取字典项表单数据 */
  getDictItemFormData(dictCode: string, id: string) {
    return request<any, DictItemForm>({
      url: `${DICT_BASE_URL}/${dictCode}/items/${id}/form`,
      method: "get",
    });
  },
  /** 修改字典项 */
  updateDictItem(dictCode: string, id: string, data: DictItemForm) {
    return request({ url: `${DICT_BASE_URL}/${dictCode}/items/${id}`, method: "put", data });
  },
  /** 删除字典项 */
  deleteDictItems(dictCode: string, ids: string) {
    return request({ url: `${DICT_BASE_URL}/${dictCode}/items/${ids}`, method: "delete" });
  },
};

export default DictAPI;

export interface DictPageQuery extends PageQuery {
  /** 搜索关键字 */
  keywords?: string;
  /** 状态(1:启用;0:禁用) */
  status?: number;
}
export interface DictPageVO {
  /** 字典ID */
  id: string;
  /** 字典名称 */
  name: string;
  /** 字典编码 */
  dictCode: string;
  /** 状态(1:启用;0:禁用) */
  status: number;
}
export interface DictForm {
  /** 字典ID(新增不填) */
  id?: string;
  /** 字典名称 */
  name?: string;
  /** 字典编码 */
  dictCode?: string;
  /** 状态(1:启用;0:禁用) */
  status?: number;
  /** 备注 */
  remark?: string;
}
export interface DictItemPageQuery extends PageQuery {
  /** 搜索关键字 */
  keywords?: string;
  /** 字典编码 */
  dictCode?: string;
}
export interface DictItemPageVO {
  /** 字典项ID */
  id: string;
  /** 字典编码 */
  dictCode: string;
  /** 字典项值 */
  value: string;
  /** 字典项标签 */
  label: string;
  /** 状态(1:启用;0:禁用) */
  status: number;
  /** 排序 */
  sort?: number;
}
export interface DictItemForm {
  /** 字典项ID(新增不填) */
  id?: string;
  /** 字典编码 */
  dictCode?: string;
  /** 字典项值 */
  value?: string;
  /** 字典项标签 */
  label?: string;
  /** 状态(1:启用;0:禁用) */
  status?: number;
  /** 排序 */
  sort?: number;
  /** 标签类型 */
  tagType?: "success" | "warning" | "info" | "primary" | "danger" | "";
}
export interface DictItemOption {
  /** 值 */
  value: number | string;
  /** 标签 */
  label: string;
  /** 标签类型 */
  tagType?: "" | "success" | "info" | "warning" | "danger";
  [key: string]: any;
}
