import request from "@utils/request";

export function list(queryParams:object) {
    return request({
        url: '/mall-pms/api/v1/categories',
        method: 'get',
        params: queryParams
    })
}

export function cascadeList(queryParams:object) {
    return request({
        url: '/mall-pms/api/v1/categories/cascade',
        method: 'get',
        params: queryParams
    })
}



export function detail(id:number) {
    return request({
        url: '/mall-pms/api/v1/categories/' + id,
        method: 'get'
    })
}

export function add(data:object) {
    return request({
        url: '/mall-pms/api/v1/categories',
        method: 'post',
        data: data
    })
}

export function update(id:number, data:object) {
    return request({
        url: '/mall-pms/api/v1/categories/' + id,
        method: 'put',
        data: data
    })
}

export function del(ids:string) {
    return request({
        url: '/mall-pms/api/v1/categories/' + ids,
        method: 'delete'
    })
}

export function patch(id:number, data:object) {
    return request({
        url: '/mall-pms/api/v1/categories/' + id,
        method: 'patch',
        data: data
    })
}
