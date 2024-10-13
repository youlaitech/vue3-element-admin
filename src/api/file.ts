import request from "@/utils/request";

const FileAPI = {
  /**
   * 文件上传地址
   */
  uploadUrl: import.meta.env.VITE_APP_BASE_API + "/api/v1/files",

  /**
   * 上传文件
   *
   * @param file
   */
  upload(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return request<any, FileInfo>({
      url: "/api/v1/files",
      method: "post",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  /**
   * 删除文件
   *
   * @param filePath 文件完整路径
   */
  deleteByPath(filePath?: string) {
    return request({
      url: "/api/v1/files",
      method: "delete",
      params: { filePath: filePath },
    });
  },

  /**
   * 下载文件
   * @param url
   * @param fileName
   */
  downloadFile(url: string, fileName?: string) {
    return request({
      url: url,
      method: "get",
      responseType: "blob",
    }).then((res) => {
      const blob = new Blob([res.data]);
      const a = document.createElement("a");
      const url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = fileName || "下载文件";
      a.click();
      window.URL.revokeObjectURL(url);
    });
  },
};

export default FileAPI;

/**
 * 文件API类型声明
 */
export interface FileInfo {
  /** 文件名 */
  name: string;
  /** 文件路径 */
  url: string;
}
