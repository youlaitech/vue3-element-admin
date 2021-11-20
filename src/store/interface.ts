// 接口类型声明
export interface UserState {
    token: string,
    nickname: string,
    avatar: string,
    roles: string[],
    perms: string[]
}


export interface AppState {
    device: string,
    sidebar: {
        opened: boolean,
        withoutAnimation: boolean
    }
}

// 顶级类型声明
export interface RootStateTypes {
    user: UserState,
    app:AppState
}