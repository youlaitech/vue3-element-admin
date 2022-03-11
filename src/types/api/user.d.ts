import { Page, PageResult } from "./base"

/**
 * 用户信息
 */
export interface UserInfo {
    nickname: string,
    avatar: string,
    roles: string[],
    perms: string[]
}

/**
 * 用户查询参数
 */
export interface UserQueryParam extends Page {
    keywords: String | undefined,
    status: number | undefined ,
    deptId: number | undefined 
}
