import request from '@/utils/request'

// export function list(queryParams:object) {
//     return request({
//         url: '/youlai-admin/api/v1/oauth-clients',
//         method: 'get',
//         params: queryParams
//     })
// }

export const listDept = (queryParams?: object) => {
    return request({
        url: '/youlai-admin/api/v1/depts/table',
        method: 'get',
        params: queryParams
    })
}

export const getDept = (deptId: any) => {
    return request({
        url: '/youlai-admin/api/v1/depts/select',
        method: 'get'
    })
}

// export const listDeptExcludeChild = (deptId: any) => {
//     return https().request<RootObject<any>>(`system/dept/list/exclude/${deptId}`, Method.GET, undefined, ContentType.form)
// }

export const delDept = (deptId: any) => {
    return request({
        url: '/youlai-admin/api/v1/depts/'+deptId,
        method: 'delete',
    })
}



// 新增部门

export const addDept = (data: any) => {
    return request({
        url: '/youlai-admin/api/v1/depts',
        method: 'post',
        data: data
    })
}

// 修改部门

export const updateDept = (data: any) => {
    return request({
        url: '/youlai-admin/api/v1/depts/' + id,
        method: 'put',
        data: data
    })
}

// // 根据角色ID查询部门树结构
// export const roleDeptTreeselect = (roleId: number | string) => {
//     return https().request<any>(`system/dept/roleDeptTreeselect/${roleId}`, Method.GET, undefined, ContentType.form)
// }
//
// // 查询部门下拉树结构
//
// export const treeselect = () => {
//     return https().request<RootObject<any>>('system/dept/treeselect', Method.GET, undefined, ContentType.form)
// }
