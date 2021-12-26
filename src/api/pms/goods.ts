import request from '@/utils/request'
export function page(queryParams:object) {
    return request({
        url: '/mall-pms/api/v1/goods/page',
        method: 'get',
        params: queryParams
    })
}

export function detail(id:number) {
    return request({
        url: '/mall-pms/api/v1/goods/' + id,
        method: 'get'
    })
}

export function addGoods(data:object) {
    return request({
        url: '/mall-pms/api/v1/goods',
        method: 'post',
        data: data
    })
}

export function updateGoods(id:number, data:object) {
    return request({
        url: '/mall-pms/api/v1/goods/' + id,
        method: 'put',
        data: data
    })
}

export function removeGoods(ids:string) {
    return request({
        url: '/mall-pms/api/v1/goods/'+ids,
        method: 'delete'
    })
}

export function patch(id:number, data:object) {
    return request({
        url: '/mall-pms/api/v1/goods/' + id,
        method: 'patch',
        data: data
    })
}
