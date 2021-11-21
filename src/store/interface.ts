import {RouteRecordRaw} from "vue-router";

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

export interface SettingState {
    theme: string,
    tagsView: boolean,
    fixedHeader: boolean,
    showSettings: boolean,
    sidebarLogo: boolean
}


export interface PermissionState{
    routes:RouteRecordRaw[]
    addRoutes: RouteRecordRaw[]
}

// 顶级类型声明
export interface RootStateTypes {
    user: UserState,
    app: AppState,
    setting: SettingState,
    permission:PermissionState
}