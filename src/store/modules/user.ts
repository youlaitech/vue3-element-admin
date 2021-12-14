import {Module} from "vuex";
import {UserState, RootStateTypes} from "@store/interface";
import {Local} from "@utils/storage";
import {getUserInfo, login, logout} from "@api/login";
import {resetRouter} from "@router";


const getDefaultState = () => {
    return {
        token: Local.get('token'),
        nickname: '',
        avatar: '',
        roles: [],
        perms: []
    }
}

const userModule: Module<UserState, RootStateTypes> = {
    namespaced: true,
    state: {
        token: Local.get('token') || '',
        nickname: '',
        avatar: '',
        roles: [],
        perms: []
    },
    mutations: {
        RESET_STATE: (state) => {
            Object.assign(state, getDefaultState())
        },
        SET_TOKEN(state: UserState, token: string) {
            state.token = token
        },
        SET_NICKNAME(state: UserState, nickname: string) {
            state.nickname = nickname
        },
        SET_AVATAR(state: UserState, avatar: string) {
            state.avatar = avatar
        },
        SET_ROLES(state: UserState, roles: string[]) {
            state.roles = roles
        },
        SET_PERMS(state: UserState, perms: string[]) {
            state.perms = perms
        }
    },
    actions: {
        /**
         * 用户登录请求
         * @param userInfo 登录用户信息
         *  username: 用户名
         *  password: 密码
         *  code: 验证码
         *  uuid: 匹配正确验证码的 key
         */
        login({commit}, userInfo: { username: string, password: string, code: string, uuid: string }) {
            const {username, password, code, uuid} = userInfo
            return new Promise((resolve, reject) => {
                login(
                    {
                        username: username.trim(),
                        password: password,
                        grant_type: 'captcha',
                        code: code,
                        uuid: uuid
                    }
                ).then(response => {
                    const {access_token, token_type} = response.data
                    const accessToken = token_type + " " + access_token
                    Local.set("token", accessToken)
                    commit('SET_TOKEN', accessToken)
                    resolve(access_token)
                }).catch(error => {
                    reject(error)
                })
            })
        },
        /**
         *  获取用户信息（昵称、头像、角色集合、权限集合）
         */
        getUserInfo({commit, state}) {
            return new Promise(((resolve, reject) => {
                    getUserInfo().then(response => {
                        const {data} = response
                        if (!data) {
                            return reject('Verification failed, please Login again.')
                        }
                        console.log(data)
                        const {nickname, avatar, roles, perms} = data
                        if (!roles || roles.length <= 0) {
                            reject('getUserInfo: roles must be a non-null array!')
                        }
                        commit('SET_NICKNAME', nickname)
                        commit('SET_AVATAR', avatar)
                        commit('SET_ROLES', roles)
                        commit('SET_PERMS', perms)

                        resolve(data)
                    }).catch(error => {
                        reject(error)
                    })
                })
            )
        },

        /**
         *  注销
         */
        logout({commit, state}) {
            return new Promise(((resolve, reject) => {
                logout().then(() => {
                    Local.remove('token')
                    commit('RESET_STATE')
                    resetRouter()
                    resolve(null)
                }).catch(error => {
                    reject(error)
                })
            }))
        },

        /**
         * 清除 Token
         */
        resetToken({commit}){
            return new Promise(resolve=>{
                Local.remove('token')
                commit('RESET_STATE')
                resolve(null)
            })
        }
    }
}

export default userModule;

