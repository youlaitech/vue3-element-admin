
import request from "@utils/request";
export const listUser = (queryParams:any)=> {
    return request({
        url: '/youlai-admin/api/v2/users',
        method: 'get',
        params: queryParams
    })
}

export const getUser = (id ?:any) =>{
    return request({
        url: '/youlai-admin/api/v1/users/' + id,
        method: 'get'
    })
}

export const addUser = (data:any) => {
    return request({
        url: '/youlai-admin/api/v1/users',
        method: 'post',
        data: data
    })
}

export const updateUser = (id:number, data:any)=> {
    return request({
        url: '/youlai-admin/api/v1/users/' + id,
        method: 'put',
        data: data
    })
}

export const patch = (id:number, data:any) => {
    return request({
        url: '/youlai-admin/api/v1/users/' + id,
        method: 'patch',
        data: data
    })
}

export const delUser =(ids:number) =>{
    return request({
        url: '/youlai-admin/api/v1/users/'+ids,
        method: 'delete',
    })
}
