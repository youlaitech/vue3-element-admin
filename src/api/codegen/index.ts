import request from "@/utils/request";
import type { GeneratorPreviewItem, TableQueryParams, TableItem, GenConfigForm } from "./types";
import type { PageResult } from "@/api/common";

const GENERATOR_BASE_URL = "/api/v1/codegen";

/**
 * 构建预览和下载接口的查询参数
 */
const buildCodegenParams = (pageType?: "classic" | "crud", type?: "ts" | "js") => {
  const params: Record<string, string> = {};
  if (pageType) {
    params.pageType = pageType;
  }
  if (type) {
    params.type = type;
  }
  return Object.keys(params).length ? params : undefined;
};

const GeneratorAPI = {
  /**
   * 获取数据表分页列表
   */
  getTablePage(params: TableQueryParams) {
    return request<unknown, PageResult<TableItem>>({
      url: `${GENERATOR_BASE_URL}/table`,
      method: "get",
      params,
    });
  },

  /**
   * 获取代码生成配置
   */
  getGenConfig(tableName: string) {
    return request<unknown, GenConfigForm>({
      url: `${GENERATOR_BASE_URL}/${tableName}/config`,
      method: "get",
    });
  },

  /**
   * AI 推断代码生成配置，未开启 AI 时返回业务异常
   */
  aiFillConfig(tableName: string, requirement?: string) {
    return request<unknown, GenConfigForm>({
      url: `${GENERATOR_BASE_URL}/${tableName}/ai-config`,
      method: "post",
      data: requirement ? { requirement } : undefined,
    });
  },

  /**
   * 保存代码生成配置
   */
  saveGenConfig(tableName: string, data: GenConfigForm) {
    return request({
      url: `${GENERATOR_BASE_URL}/${tableName}/config`,
      method: "post",
      data,
    });
  },

  /**
   * 获取代码生成预览数据
   */
  getPreviewData(tableName: string, pageType?: "classic" | "crud", type?: "ts" | "js") {
    return request<unknown, GeneratorPreviewItem[]>({
      url: `${GENERATOR_BASE_URL}/${tableName}/preview`,
      method: "get",
      params: buildCodegenParams(pageType, type),
    });
  },

  /**
   * 重置代码生成配置
   */
  resetGenConfig(tableName: string) {
    return request({
      url: `${GENERATOR_BASE_URL}/${tableName}/config`,
      method: "delete",
    });
  },

  /**
   * 下载代码生成 ZIP 文件
   */
  download(tableName: string, pageType?: "classic" | "crud", type?: "ts" | "js") {
    return request({
      url: `${GENERATOR_BASE_URL}/${tableName}/download`,
      method: "get",
      params: buildCodegenParams(pageType, type),
      responseType: "blob",
    }).then((response) => {
      const contentDisposition = response?.headers?.["content-disposition"] as string | undefined;
      let fileName = `${tableName}.zip`;
      if (contentDisposition) {
        // content-disposition: attachment; filename=xxx.zip
        const match = /filename\*?=(?:UTF-8''|")?([^;"]+)/i.exec(contentDisposition);
        if (match?.[1]) {
          try {
            fileName = decodeURIComponent(match[1]);
          } catch {
            fileName = match[1];
          }
        }
      }

      const blob = new Blob([response.data], { type: "application/zip" });
      const a = document.createElement("a");
      const downloadUrl = window.URL.createObjectURL(blob);
      a.href = downloadUrl;
      a.download = fileName;

      a.click();
      window.URL.revokeObjectURL(downloadUrl);
    });
  },
};

export default GeneratorAPI;

export * from "./types";
