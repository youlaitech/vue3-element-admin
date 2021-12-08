import request from '@/utils/request'

export function listClientsWithPage(queryParams:object) {
    return request({
        url: '/youlai-admin/api/v1/oauth-clients',
        method: 'get',
        params: queryParams
    })
}

export function detail(id:number) {
    return request({
        url: '/youlai-admin/api/v1/oauth-clients/' + id,
        method: 'get'
    })
}

export function add(data:object) {
    return request({
        url: '/youlai-admin/api/v1/oauth-clients',
        method: 'post',
        data: data
    })
}

export function update(id:number, data:object) {
    return request({
        url: '/youlai-admin/api/v1/oauth-clients/' + id,
        method: 'put',
        data: data
    })
}

export function del(ids:string) {
    return request({
        url: '/youlai-admin/api/v1/oauth-clients/'+ids,
        method: 'delete'
    })
}

export function patch(id:number, data:object) {
    return request({
        url: '/youlai-admin/api/v1/oauth-clients/' + id,
        method: 'patch',
        data: data
    })
}
