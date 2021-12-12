import request from '@/utils/request'

/**
 * 获取权限分页列表
 *
 * @param queryParams
 */
export function listPermsWithPage(queryParams: object) {
    return request({
        url: '/youlai-admin/api/v1/permissions/page',
        method: 'get',
        params: queryParams
    })
}

/**
 * 获取权限列表
 *
 * @param queryParams
 */
export function listPerms(queryParams: object) {
    return request({
        url: '/youlai-admin/api/v1/permissions',
        method: 'get',
        params: queryParams
    })
}

/**
 * 获取权限详情
 *
 * @param id
 */
export function getPermDetail(id: number) {
    return request({
        url: '/youlai-admin/api/v1/permissions/' + id,
        method: 'get'
    })
}

/**
 * 添加权限
 *
 * @param data
 */
export function addPerm(data: object) {
    return request({
        url: '/youlai-admin/api/v1/permissions',
        method: 'post',
        data: data
    })
}

/**
 * 更新权限
 *
 * @param id
 * @param data
 */
export function updatePerm(id: number, data: object) {
    return request({
        url: '/youlai-admin/api/v1/permissions/' + id,
        method: 'put',
        data: data
    })
}

/**
 * 批量删除权限，多个以英文逗号(,)分割
 *
 * @param ids
 */
export function deletePerms(ids: string) {
    return request({
        url: '/youlai-admin/api/v1/permissions/' + ids,
        method: 'delete'
    })
}

