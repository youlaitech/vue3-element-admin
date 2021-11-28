import request from '@/utils/request'

export function getRouteList() {
    return request({
        url: '/youlai-admin/api/v2/menus/route',
        method: 'get'
    })
}