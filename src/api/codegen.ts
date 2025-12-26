import request from "@/utils/request";
import type { GeneratorPreviewVo, TablePageQuery, TablePageVo, GenConfigForm } from "@/types/api";

const GENERATOR_BASE_URL = "/api/v1/codegen";

const GeneratorAPI = {
  /** 获取数据表分页列表 */
  getTablePage(params: TablePageQuery) {
    return request<any, PageResult<TablePageVo[]>>({
      url: `${GENERATOR_BASE_URL}/table/page`,
      method: "get",
      params,
    });
  },

  /** 获取代码生成配置 */
  getGenConfig(tableName: string) {
    return request<any, GenConfigForm>({
      url: `${GENERATOR_BASE_URL}/${tableName}/config`,
      method: "get",
    });
  },

  /** 获取代码生成配置 */
  saveGenConfig(tableName: string, data: GenConfigForm) {
    return request({
      url: `${GENERATOR_BASE_URL}/${tableName}/config`,
      method: "post",
      data,
    });
  },

  /** 获取代码生成预览数据 */
  getPreviewData(tableName: string, pageType?: "classic" | "curd") {
    return request<any, GeneratorPreviewVo[]>({
      url: `${GENERATOR_BASE_URL}/${tableName}/preview`,
      method: "get",
      params: pageType ? { pageType } : undefined,
    });
  },

  /** 重置代码生成配置 */
  resetGenConfig(tableName: string) {
    return request({
      url: `${GENERATOR_BASE_URL}/${tableName}/config`,
      method: "delete",
    });
  },

  /**
   * 下载 ZIP 文件
   * @param url
   * @param fileName
   */
  download(tableName: string, pageType?: "classic" | "curd") {
    return request({
      url: `${GENERATOR_BASE_URL}/${tableName}/download`,
      method: "get",
      params: pageType ? { pageType } : undefined,
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
      const url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = fileName;

      a.click();
      window.URL.revokeObjectURL(url);
    });
  },
};

export default GeneratorAPI;

/** 代码生成预览对象 */
