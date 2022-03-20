import {RouteRecordRaw} from "vue-router";

/**
 * 权限类型声明
 */
export interface PermissionState{
    routes:RouteRecordRaw[]
    addRoutes: RouteRecordRaw[]
}
