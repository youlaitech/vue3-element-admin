import request from "@/utils/request";
import type {
  DictTypeQueryParams,
  DictTypeItem,
  DictTypeForm,
  DictItemQueryParams,
  DictItem,
  DictItemForm,
  DictItemOption,
  OptionItem,
} from "@/types/api";

const DICT_BASE_URL = "/api/v1/dicts";

type DictTagTypeCode = "N" | "P" | "S" | "W" | "I" | "D";

const decodeDictTagType = (code?: unknown): DictItemForm["tagType"] => {
  const val = String(code ?? "")
    .trim()
    .toUpperCase();
  switch (val as DictTagTypeCode) {
    case "P":
      return "primary";
    case "S":
      return "success";
    case "W":
      return "warning";
    case "I":
      return "info";
    case "D":
      return "danger";
    case "N":
    default:
      return "";
  }
};

const encodeDictTagType = (tagType?: unknown): DictTagTypeCode => {
  const val = String(tagType ?? "")
    .trim()
    .toLowerCase();
  switch (val) {
    case "primary":
      return "P";
    case "success":
      return "S";
    case "warning":
      return "W";
    case "info":
      return "I";
    case "danger":
    case "error":
      return "D";
    case "default":
    case "":
    default:
      return "N";
  }
};

const DictAPI = {
  /** 字典分页列表 */
  getPage(queryParams: DictTypeQueryParams) {
    return request<any, PageResult<DictTypeItem>>({
      url: `${DICT_BASE_URL}`,
      method: "get",
      params: queryParams,
    });
  },
  /** 字典列表 */
  getList() {
    return request<any, OptionItem[]>({ url: `${DICT_BASE_URL}/options`, method: "get" });
  },
  /** 字典表单数据 */
  getFormData(id: string) {
    return request<any, DictTypeForm>({ url: `${DICT_BASE_URL}/${id}/form`, method: "get" });
  },
  /** 新增字典 */
  create(data: DictTypeForm) {
    return request({ url: `${DICT_BASE_URL}`, method: "post", data });
  },
  /** 修改字典 */
  update(id: string, data: DictTypeForm) {
    return request({ url: `${DICT_BASE_URL}/${id}`, method: "put", data });
  },
  /** 删除字典 */
  deleteByIds(ids: string) {
    return request({ url: `${DICT_BASE_URL}/${ids}`, method: "delete" });
  },

  /** 获取字典项分页列表 */
  getDictItemPage(dictCode: string, queryParams: DictItemQueryParams) {
    return request<any, PageResult<DictItem>>({
      url: `${DICT_BASE_URL}/${dictCode}/items`,
      method: "get",
      params: queryParams,
    }).then((res) => ({
      ...res,
      data: (res.data ?? []).map((item) => ({
        ...item,
        tagType: decodeDictTagType((item as any).tagType),
      })),
    }));
  },
  /** 获取字典项列表 */
  getDictItems(dictCode: string) {
    return request<any, DictItemOption[]>({
      url: `${DICT_BASE_URL}/${dictCode}/items/options`,
      method: "get",
    }).then((items) =>
      (items ?? []).map((item) => ({
        ...item,
        tagType: decodeDictTagType((item as any).tagType),
      }))
    );
  },
  /** 新增字典项 */
  createDictItem(dictCode: string, data: DictItemForm) {
    return request({
      url: `${DICT_BASE_URL}/${dictCode}/items`,
      method: "post",
      data: {
        ...data,
        tagType: encodeDictTagType((data as any).tagType),
      },
    });
  },
  /** 获取字典项表单数据 */
  getDictItemFormData(dictCode: string, id: string) {
    return request<any, DictItemForm>({
      url: `${DICT_BASE_URL}/${dictCode}/items/${id}/form`,
      method: "get",
    }).then((form) => ({
      ...form,
      tagType: decodeDictTagType((form as any).tagType),
    }));
  },
  /** 修改字典项 */
  updateDictItem(dictCode: string, id: string, data: DictItemForm) {
    return request({
      url: `${DICT_BASE_URL}/${dictCode}/items/${id}`,
      method: "put",
      data: {
        ...data,
        tagType: encodeDictTagType((data as any).tagType),
      },
    });
  },
  /** 删除字典项 */
  deleteDictItems(dictCode: string, ids: string) {
    return request({ url: `${DICT_BASE_URL}/${dictCode}/items/${ids}`, method: "delete" });
  },
};

export default DictAPI;
