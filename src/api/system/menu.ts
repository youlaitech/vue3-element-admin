import request from '@/utils/request'

export function getRouteList() {
    return request({
        url: '/youlai-admin/api/v1/menus/route',
        method: 'get'
    })
}