/**
 * 提取并解码响应头文件名，缺失时生成默认名称。
 */
function extractFileName(contentDisposition: string): string {
  if (!contentDisposition) {
    return `download_${Date.now()}`;
  }

  // 优先使用 UTF-8 编码的 filename*。
  const filenameRegex = /filename\*=UTF-8''([^;]+)/i;
  const matches = filenameRegex.exec(contentDisposition);
  if (matches && matches[1]) {
    return decodeFileName(matches[1]);
  }

  // 兼容普通 filename 参数。
  const fallbackRegex = /filename=([^;]+)/;
  const fallbackMatches = fallbackRegex.exec(contentDisposition);
  if (fallbackMatches && fallbackMatches[1]) {
    return decodeFileName(fallbackMatches[1].trim().replace(/^"|"$/g, ""));
  }

  return `download_${Date.now()}`;
}

/**
 * 解码响应头中的文件名，编码无效时保留原值。
 */
function decodeFileName(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * 下载所需的二进制内容与可选响应头。
 */
interface DownloadResponse {
  /** 二进制内容 */
  data: BlobPart;
  /** 响应头（用于解析文件名，自组装数据可省略） */
  headers?: Record<string, unknown>;
}

/**
 * 触发浏览器下载，优先使用指定文件名，其次读取响应头。
 */
export function downloadFile(response: DownloadResponse, customFileName?: string): void {
  try {
    const fileData = response.data;
    const contentDisposition = String(response.headers?.["content-disposition"] ?? "");
    const fileName = customFileName || extractFileName(contentDisposition);

    const blob = new Blob([fileData]);

    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();

    // 下载触发后释放临时 URL，避免累积浏览器资源。
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error("文件下载失败:", error);
    throw error;
  }
}
