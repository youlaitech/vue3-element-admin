import request from "@/utils/request";
import type {
  DictTypeQueryParams,
  DictTypeItem,
  DictTypeForm,
  DictItemQueryParams,
  DictItem,
  DictItemForm,
  DictItemOption,
} from "./types";
import type { OptionItem, PageResult } from "@/api/common";

const DICT_BASE_URL = "/api/v1/dicts";

type DictTagType = DictItemForm["tagType"];

/**
 * 标签样式以语义全称（primary/success/warning/danger/info）存储，单字母是历史数据，这里兼容读取
 */
const decodeDictTagType = (code?: unknown): DictTagType => {
  const val = String(code ?? "")
    .trim()
    .toUpperCase();
  switch (val) {
    case "P":
    case "PRIMARY":
      return "primary";
    case "S":
    case "SUCCESS":
      return "success";
    case "W":
    case "WARNING":
      return "warning";
    case "I":
    case "INFO":
      return "info";
    case "D":
    case "DANGER":
    case "ERROR":
      return "danger";
    case "N":
    case "DEFAULT":
    default:
      return "";
  }
};

/**
 * 统一转换字典项标签类型
 */
const normalizeDictTagType = <T extends { tagType?: unknown }>(
  item: T
): Omit<T, "tagType"> & {
  tagType: DictTagType;
} => ({
  ...item,
  tagType: decodeDictTagType(item.tagType),
});

const DictAPI = {
  // 字典相关接口
  /**
   * 字典分页列表
   */
  getPage(queryParams: DictTypeQueryParams) {
    return request<unknown, PageResult<DictTypeItem>>({
      url: `${DICT_BASE_URL}`,
      method: "get",
      params: queryParams,
    });
  },
  /**
   * 字典列表
   */
  getList() {
    return request<unknown, OptionItem[]>({ url: `${DICT_BASE_URL}/options`, method: "get" });
  },
  /**
   * 字典表单数据
   */
  getFormData(id: string) {
    return request<unknown, DictTypeForm>({ url: `${DICT_BASE_URL}/${id}/form`, method: "get" });
  },
  /**
   * 新增字典
   */
  create(data: DictTypeForm) {
    return request({ url: `${DICT_BASE_URL}`, method: "post", data });
  },
  /**
   * 修改字典
   */
  update(id: string, data: DictTypeForm) {
    return request({ url: `${DICT_BASE_URL}/${id}`, method: "put", data });
  },
  /**
   * 删除字典
   */
  deleteByIds(ids: string) {
    return request({ url: `${DICT_BASE_URL}/${ids}`, method: "delete" });
  },

  // 字典项相关接口
  /**
   * 获取字典项分页列表
   */
  getDictItemPage(dictCode: string, queryParams: DictItemQueryParams) {
    return request<unknown, PageResult<DictItem>>({
      url: `${DICT_BASE_URL}/${dictCode}/items`,
      method: "get",
      params: queryParams,
    }).then((data) => ({
      ...data,
      list: (data.list ?? []).map(normalizeDictTagType),
    }));
  },
  /**
   * 获取字典项列表
   */
  getDictItems(dictCode: string) {
    return request<unknown, DictItemOption[]>({
      url: `${DICT_BASE_URL}/${dictCode}/items/options`,
      method: "get",
    }).then((items) => (items ?? []).map(normalizeDictTagType));
  },
  /**
   * 新增字典项
   */
  createDictItem(dictCode: string, data: DictItemForm) {
    return request({
      url: `${DICT_BASE_URL}/${dictCode}/items`,
      method: "post",
      data,
    });
  },
  /**
   * 获取字典项表单数据
   */
  getDictItemFormData(dictCode: string, id: string) {
    return request<unknown, DictItemForm>({
      url: `${DICT_BASE_URL}/${dictCode}/items/${id}/form`,
      method: "get",
    }).then(normalizeDictTagType);
  },
  /**
   * 修改字典项
   */
  updateDictItem(dictCode: string, id: string, data: DictItemForm) {
    return request({
      url: `${DICT_BASE_URL}/${dictCode}/items/${id}`,
      method: "put",
      data,
    });
  },
  /**
   * 删除字典项
   */
  deleteDictItems(dictCode: string, ids: string) {
    return request({ url: `${DICT_BASE_URL}/${dictCode}/items/${ids}`, method: "delete" });
  },
};

export default DictAPI;

// 重导出类型
export * from "./types";
