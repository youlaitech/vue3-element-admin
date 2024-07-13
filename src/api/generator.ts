import request from "@/utils/request";

const USER_BASE_URL = "/api/v1/generators";

class GeneratorAPI {
  /**
   * 获取代码生成预览数据
   */
  static getPreviewData(tableName: string) {
    return request<any, GeneratorPreviewVO>({
      url: `${USER_BASE_URL}/preview/${tableName}`,
      method: "get",
    });
  }
}

export default GeneratorAPI;

/** 代码生成预览对象 */
export interface GeneratorPreviewVO {}
