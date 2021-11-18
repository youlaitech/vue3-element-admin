import {Module} from "vuex";
import {UserState, RootStateTypes} from "@store/interface";
import {Local} from "@utils/storage";
import {login} from "@api/login"
import {rejects} from "assert";

const userModule: Module<UserState, RootStateTypes> = {
    namespaced: true,
    state: {
        token: Local.get('token') || '',
        name: '',
        avatar: '',
        introduction: '',
        roles: [],
        perms: []
    },
    mutations: {
        SET_TOKEN(state: UserState, token: string) {
            state.token = token
        },
        SET_NAME(state: UserState, name: string) {
            state.name = name
        },
        SET_AVATAR(state: UserState, avatar: string) {
            state.avatar = avatar
        },
        SET_INTRODUCTION(state: UserState, introduction: string) {
            state.introduction = introduction
        },
        SET_ROLES(state: UserState, roles: string[]) {
            state.roles = roles
        },
        SET_PERMS(state: UserState, perms: string[]) {
            state.perms = perms
        }
    },
    actions: {
        // 登录
         login({commit}, userInfo: { username: string, password: string }) {
            const {username, password} = userInfo
            return new Promise((resolve, reject) => {
                login({ username: username.trim(), password: password }).then(response => {
                    const {access_token, token_type} = response.data
                    const accessToken = token_type + " " + access_token
                    Local.set("token",accessToken)
                    commit('SET_TOKEN',accessToken)
                }).catch(error => {
                    reject(error)
                })
            })
        }

    }
}

export default userModule;

