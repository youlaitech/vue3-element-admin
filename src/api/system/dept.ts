import request from '@/utils/request'

/**
 * 部门树形表格
 *
 * @param queryParams
 */
export function listDeptTable(queryParams?: object) {
    return request({
        url: '/youlai-admin/api/v1/depts/table',
        method: 'get',
        params: queryParams
    })
}

/**
 * 部门下拉列表
 */
export function listDeptSelect() {
    return request({
        url: '/youlai-admin/api/v1/depts/select',
        method: 'get'
    })
}

/**
 * 获取部门详情
 *
 * @param id
 */
export function getDeptDetail(id: any) {
    return request({
        url: '/youlai-admin/api/v1/depts/' + id,
        method: 'get'
    })
}


/**
 * 新增部门
 *
 * @param data
 */
export function addDept(data: any) {
    return request({
        url: '/youlai-admin/api/v1/depts',
        method: 'post',
        data: data
    })
}

/**
 *  修改部门
 *
 * @param id
 * @param data
 */
export function updateDept(id: number, data: any) {
    return request({
        url: '/youlai-admin/api/v1/depts/' + id,
        method: 'put',
        data: data
    })
}

/**
 * 删除部门
 *
 * @param id
 */
export function deleteDept(id: any) {
    return request({
        url: '/youlai-admin/api/v1/depts/' + id,
        method: 'delete',
    })
}

