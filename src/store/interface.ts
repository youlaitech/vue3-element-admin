// 接口类型声明
export interface UserState {
    token: string,
    name: string,
    avatar: string,
    introduction: string,
    roles: string[],
    perms: string[]
}


// 顶级类型声明
export interface RootStateTypes {
    user: UserState
}