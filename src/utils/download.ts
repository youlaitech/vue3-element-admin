/**
 * 文件下载工具函数
 */

/**
 * 从响应头中提取文件名
 * @param contentDisposition Content-Disposition 响应头
 * @returns 解码后的文件名
 */
function extractFileName(contentDisposition: string): string {
  if (!contentDisposition) {
    return `download_${Date.now()}`;
  }

  // 尝试从 filename*=UTF-8'' 格式中提取
  const filenameRegex = /filename\*=UTF-8''(.+)/;
  const matches = filenameRegex.exec(contentDisposition);
  if (matches && matches[1]) {
    return decodeURIComponent(matches[1]);
  }

  // 尝试从 filename= 格式中提取
  const fallbackRegex = /filename=([^;]+)/;
  const fallbackMatches = fallbackRegex.exec(contentDisposition);
  if (fallbackMatches && fallbackMatches[1]) {
    return decodeURI(fallbackMatches[1].replace(/"/g, ""));
  }

  return `download_${Date.now()}`;
}

/**
 * 下载响应：axios 二进制响应（blob 透传整个 response）或自组装的二进制数据
 */
interface DownloadResponse {
  /** 二进制内容 */
  data: BlobPart;
  /** 响应头（用于解析文件名，自组装数据可省略） */
  headers?: Record<string, unknown>;
}

/**
 * 下载文件
 * @param response 二进制接口响应或 { data } 形式的二进制内容
 * @param customFileName 自定义文件名（可选）
 *
 * @example
 * ```ts
 * // 基础用法
 * const response = await UserAPI.export(queryParams);
 * downloadFile(response);
 *
 * // 自定义文件名
 * downloadFile(response, "用户列表.xlsx");
 * ```
 */
export function downloadFile(response: DownloadResponse, customFileName?: string): void {
  try {
    const fileData = response.data;
    const contentDisposition = String(response.headers?.["content-disposition"] ?? "");
    const fileName = customFileName || extractFileName(contentDisposition);

    // 创建 Blob 对象
    const blob = new Blob([fileData]);

    // 创建下载链接
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = fileName;

    // 触发下载
    document.body.appendChild(link);
    link.click();

    // 清理
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error("文件下载失败:", error);
    throw error;
  }
}
