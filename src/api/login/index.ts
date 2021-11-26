import request from "@utils/request";

/**
 * 登录
 * @param data
 */
export function login(data: object) {
    return request({
        url: '/youlai-auth/oauth/token',
        method:'post',
        params: data,
        headers: {
            'Authorization': 'Basic bWFsbC1hZG1pbi13ZWI6MTIzNDU2' // 客户端信息Base64明文：mall-admin-web:123456
        }
    })
}

/**
 * 登录成功后获取用户信息（包括用户头像、权限列表等）
 */
export function getUserInfo() {
    return request({
        url: '/youlai-admin/api/v1/users/me',
        method: 'get'
    })
}

/**
 * 注销
 */
export function logout() {
    return request({
        url: '/youlai-auth/oauth/logout',
        method: 'delete'
    })
}

/**
 * 获取图片验证码
 */
export function getCaptcha() {
    return request({
        url: '/captcha?t='+(new Date()).getTime().toString(),
        method: 'get'
    })
}