import request from "@utils/request";


/**
 * 获取字典分页列表
 *
 * @param queryParams
 */
export function listDictByPage(queryParams: object) {
    return request({
        url: '/youlai-admin/api/v2/dict/page',
        method: 'get',
        params: queryParams
    })
}

/**
 * 新增字典
 *
 * @param data
 */
export function addDict(data: object) {
    return request({
        url: '/youlai-admin/api/v2/dict',
        method: 'post',
        data: data
    })
}

/**
 * 修改字典
 *
 * @param id
 * @param data
 */
export function updateDict(id: number, data: object) {
    return request({
        url: '/youlai-admin/api/v2/dict/' + id,
        method: 'put',
        data: data
    })
}


/**
 * 获取字典项分页列表
 *
 * @param queryParams
 */
export function listDictItemsByPage(queryParams: object) {
    return request({
        url: '/youlai-admin/api/v2/dict/items/page',
        method: 'get',
        params: queryParams
    })
}


/**
 * 根据字典编码获取字典项列表
 *
 * @param dictCode
 */
export function listDictItems(dictCode: string) {
    return request({
        url: '/youlai-admin/api/v2/dict/items',
        method: 'get',
        params: {dictCode: dictCode}
    })
}


/**
 * 新增字典项
 *
 * @param data
 */
export function addDictItem(data: object) {
    return request({
        url: '/youlai-admin/api/v2/dict/items',
        method: 'post',
        data: data
    })
}

/**
 * 修改字典项
 *
 * @param id
 * @param data
 */
export function updateDictItem(id: number, data: object) {
    return request({
        url: '/youlai-admin/api/v2/dict/items/' + id,
        method: 'put',
        data: data
    })
}


