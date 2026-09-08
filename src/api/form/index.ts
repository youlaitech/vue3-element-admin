import request from "@/utils/request";
import type {
  FormDefinitionData,
  FormDefinitionItem,
  FormDefinitionQueryParams,
  FormDataItem,
  FormDataQueryParams,
  FormMenuConfig,
  FormMenuFormData,
  FormRenderData,
} from "./types";
import type { OptionItem, PageResult } from "@/api/common";

const FORM_BASE_URL = "/api/v1/forms";

const FormAPI = {
  /** 审批表单下拉选项（工作流设计器绑定表单用，仅已发布 workflow 类型） */
  getWorkflowOptions() {
    return request<unknown, OptionItem[]>({
      url: `${FORM_BASE_URL}/options`,
      method: "get",
    });
  },
  /** 表单定义分页列表 */
  getPage(queryParams: FormDefinitionQueryParams) {
    return request<unknown, PageResult<FormDefinitionItem>>({
      url: FORM_BASE_URL,
      method: "get",
      params: queryParams,
    });
  },
  /** 表单定义表单数据（编辑回显） */
  getFormData(id: string) {
    return request<unknown, FormDefinitionData>({
      url: `${FORM_BASE_URL}/${id}/form`,
      method: "get",
    });
  },
  /** 新增表单定义 */
  create(data: FormDefinitionData) {
    return request({ url: FORM_BASE_URL, method: "post", data });
  },
  /** 修改表单定义（设计器保存规则） */
  update(id: string, data: FormDefinitionData) {
    return request({ url: `${FORM_BASE_URL}/${id}`, method: "put", data });
  },
  /** 删除表单定义（ids 多个用逗号拼接） */
  deleteByIds(ids: string) {
    return request({ url: `${FORM_BASE_URL}/${ids}`, method: "delete" });
  },
  /** 发布表单 */
  publish(id: string) {
    return request({ url: `${FORM_BASE_URL}/${id}/publish`, method: "put" });
  },
  /** 停用表单 */
  disable(id: string) {
    return request({ url: `${FORM_BASE_URL}/${id}/disable`, method: "put" });
  },
  /** 获取表单渲染规则（已发布） */
  getRender(formKey: string) {
    return request<unknown, FormRenderData>({
      url: `${FORM_BASE_URL}/${formKey}/render`,
      method: "get",
    });
  },
  /** 获取公开表单渲染规则（匿名，Security 白名单接口） */
  getPublicRender(formKey: string) {
    return request<unknown, FormRenderData>({
      url: `${FORM_BASE_URL}/public/${formKey}/render`,
      method: "get",
      // 匿名页显式跳过 token 注入，避免已登录管理员预览分享链接时携带身份
      headers: { Authorization: "no-auth" },
    });
  },
  /** 匿名提交公开表单数据（后端按 formKey + IP 限流防刷） */
  submitPublicFormData(formKey: string, data: Record<string, unknown>) {
    return request({
      url: `${FORM_BASE_URL}/public/${formKey}/data`,
      method: "post",
      data,
      headers: { Authorization: "no-auth" },
    });
  },
  /** 表单数据分页列表 */
  getFormDataPage(formKey: string, queryParams: FormDataQueryParams) {
    return request<unknown, PageResult<FormDataItem>>({
      url: `${FORM_BASE_URL}/${formKey}/data`,
      method: "get",
      params: queryParams,
    });
  },
  /** 提交表单数据 */
  submitFormData(formKey: string, data: Record<string, unknown>) {
    return request({
      url: `${FORM_BASE_URL}/${formKey}/data`,
      method: "post",
      data,
    });
  },
  /** 获取表单数据详情（只读回显，返回提交时版本的规则快照） */
  getFormDataDetail(formKey: string, dataId: string) {
    return request<unknown, FormDataItem>({
      url: `${FORM_BASE_URL}/${formKey}/data/${dataId}`,
      method: "get",
    });
  },
  /** 删除表单数据（ids 多个用逗号拼接） */
  deleteFormData(formKey: string, ids: string) {
    return request({ url: `${FORM_BASE_URL}/${formKey}/data/${ids}`, method: "delete" });
  },
  /** 获取表单菜单配置（发布向导回显） */
  getFormMenu(formId: string) {
    return request<unknown, FormMenuConfig | null>({
      url: `${FORM_BASE_URL}/${formId}/menu`,
      method: "get",
    });
  },
  /** 生成/更新表单访问菜单（事务内建菜单并授权可见角色） */
  saveFormMenu(formId: string, data: FormMenuFormData) {
    return request({ url: `${FORM_BASE_URL}/${formId}/menu`, method: "post", data });
  },
};

export default FormAPI;

// 重导出类型
export * from "./types";
