import request from '@/utils/request'
export const page = (queryParams:object)=> {
    return request({
        url: '/mall-pms/api/v1/goods/page',
        method: 'get',
        params: queryParams
    })
}

export const detail=(id:number)=> {
    return request({
        url: '/mall-pms/api/v1/goods/' + id,
        method: 'get'
    })
}

export const addGoods=(data:object)=> {
    return request({
        url: '/mall-pms/api/v1/goods',
        method: 'post',
        data: data
    })
}

export const  updateGoods=(id:number, data:object)=> {
    return request({
        url: '/mall-pms/api/v1/goods/' + id,
        method: 'put',
        data: data
    })
}

export const removeGoods=(ids:string)=> {
    return request({
        url: '/mall-pms/api/v1/goods/'+ids,
        method: 'delete'
    })
}

export const patch=(id:number, data:object)=> {
    return request({
        url: '/mall-pms/api/v1/goods/' + id,
        method: 'patch',
        data: data
    })
}
