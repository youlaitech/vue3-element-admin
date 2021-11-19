// 接口类型声明
export interface UserState {
    token: string,
    nickname: string,
    avatar: string,
    roles: string[],
    perms: string[]
}


// 顶级类型声明
export interface RootStateTypes {
    user: UserState
}