import request from '@/utils/request'

export function deleteFile(path: string) {
    return request({
        url: '/youlai-admin/api/v1/files',
        method: 'delete',
        params: {path: path}
    })
}
