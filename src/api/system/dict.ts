import request from "@utils/request";

/**
 * 获取字典分页列表
 *
 * @param queryParams
 */
export function listDictWithPage(queryParams: object) {
    return request({
        url: '/youlai-admin/api/v2/dict/page',
        method: 'get',
        params: queryParams
    })
}

/**
 * 获取字典详情
 *
 * @param id
 */
export function getDictDetail(id: number) {
    return request({
        url: '/youlai-admin/api/v2/dict/' + id,
        method: 'get'
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
 * 批量删除字典
 * @param ids 字典ID，多个以英文逗号(,)分割
 */
export function deleteDict(ids: string) {
    return request({
        url: '/youlai-admin/api/v2/dict/' + ids,
        method: 'delete',
    })
}

/**
 * 获取字典项分页列表
 *
 * @param queryParams
 */
export function listDictItemsWithPage(queryParams: object) {
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
export function getDictItemsByCode(dictCode: string) {
    return request({
        url: '/youlai-admin/api/v2/dict/items',
        method: 'get',
        params: {dictCode: dictCode}
    })
}

/**
 * 获取字典项详情
 *
 * @param id
 */
export function getDictItemDetail(id: number) {
    return request({
        url: '/youlai-admin/api/v2/dict/items/' + id,
        method: 'get'
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

/**
 * 批量删除字典项
 * @param ids 字典项ID，多个以英文逗号(,)分割
 */
export function deleteDictItem(ids: string) {
    return request({
        url: '/youlai-admin/api/v2/dict/items/' + ids,
        method: 'delete',
    })
}
