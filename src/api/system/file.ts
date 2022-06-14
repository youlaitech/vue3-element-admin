import request from '@/utils/request';

/**
 * 上传文件
 *
 * @param file
 */
export function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return request({
    url: '/youlai-admin/api/v1/files',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

/**
 * 删除文件
 *
 * @param path
 */
export function deleteFile(path?: string) {
  return request({
    url: '/youlai-admin/api/v1/files',
    method: 'delete',
    params: { path: path },
  });
}
