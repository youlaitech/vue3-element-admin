import request from '@/utils/request'

/**
 * 获取角色分页列表
 *
 * @param queryParams
 */
export function listRolesWithPage(queryParams: object) {
    return request({
        url: '/youlai-admin/api/v1/roles/page',
        method: 'get',
        params: queryParams
    })
}

/**
 * 获取角色列表
 *
 * @param queryParams
 */
export function listRoles(queryParams: object) {
    return request({
        url: '/youlai-admin/api/v1/roles',
        method: 'get',
        params: queryParams
    })
}

/**
 * 获取角色详情
 *
 * @param id
 */
export function getPermDetail(id: number) {
    return request({
        url: '/youlai-admin/api/v1/roles/' + id,
        method: 'get'
    })
}

/**
 * 添加角色
 *
 * @param data
 */
export function addPerm(data: object) {
    return request({
        url: '/youlai-admin/api/v1/roles',
        method: 'post',
        data: data
    })
}

/**
 * 更新角色
 *
 * @param id
 * @param data
 */
export function updatePerm(id: number, data: object) {
    return request({
        url: '/youlai-admin/api/v1/roles/' + id,
        method: 'put',
        data: data
    })
}

/**
 * 批量删除角色，多个以英文逗号(,)分割
 *
 * @param ids
 */
export function deleteRoles(ids: string) {
    return request({
        url: '/youlai-admin/api/v1/roles/' + ids,
        method: 'delete'
    })
}

