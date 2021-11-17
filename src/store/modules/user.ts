import {Module} from "vuex";

// vuex的Module使用 https://blog.csdn.net/fanweilin0123/article/details/109903447
export interface State {
    token:string,
    name:string,
    avatar:string,
    introduction:string,
    roles:string[],
    perms:string[]
}