import request from '@/utils/request'

export const listDept = (queryParams?: object) => {
    return request({
        url: '/youlai-admin/api/v1/depts/table',
        method: 'get',
        params: queryParams
    })
}

export const getDept = (id: any) => {
    return request({
        url: '/youlai-admin/api/v1/depts/'+id,
        method: 'get'
    })
}

export const delDept = (id: any) => {
    return request({
        url: '/youlai-admin/api/v1/depts/'+id,
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
export const updateDept = (id:number,data: any) => {
    return request({
        url: '/youlai-admin/api/v1/depts/'+id,
        method: 'put',
        data: data
    })
}


export const getDeptSelectList = ()=> {
    return request({
        url: '/youlai-admin/api/v1/depts/select',
        method: 'get'
    })
}
