import { PageQueryParam, PageResult } from "../base"

/**
 * 用户信息类型声明
 */
export interface UserInfo {
    nickname: string,
    avatar: string,
    roles: string[],
    perms: string[]
}

/**
 * 用户查询参数类型声明
 */
export interface UserQueryParam extends PageQueryParam {
    keywords: String | undefined,
    status: number | undefined,
    deptId: number | undefined
}


/**
 * 用户分页列表项声明
 */
export interface UserItem {
    id: string;
    username: string;
    nickname: string;
    mobile: string;
    gender: number;
    avatar: string;
    email: string;
    status: number;
    deptName: string;
    roleNames: string;
    gmtCreate: string;
}

/**
 * 用户分页项类型声明
 */
export interface UserPageResult extends PageResult<UserItem[]> {

}

/**
 * 用户表单类型声明
 */
export interface UserFormData {
    id: number | undefined,
    deptId: number,
    username: string,
    nickname: string,
    password: string,
    mobile: string,
    email: string,
    gender: number,
    status: number,
    remark: string,
    roleIds: number[]
}