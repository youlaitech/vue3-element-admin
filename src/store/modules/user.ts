import { defineStore } from "pinia";
import { store } from "@/store";
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

export const useUserStore = defineStore({
   id:"youlai-user",
    state: ():UserState=>({
        token: Local.get('token') || '',
        nickname: '',
        avatar: '',
        roles: [],
        perms: []
    }),
    actions: {
        async RESET_STATE () {
            // Object.assign(this.state, getDefaultState())
            this.$reset()
        },
        async SET_TOKEN(token: string) {
            this.token = token
        },
        async  SET_NICKNAME( nickname: string) {
            this.nickname = nickname
        },
        async SET_AVATAR(avatar: string) {
            this.avatar = avatar
        },
        async  SET_ROLES(roles: string[]) {
            this.roles = roles
        },
        async SET_PERMS( perms: string[]) {
            this.perms = perms
        },
        /**
         * 用户登录请求
         * @param userInfo 登录用户信息
         *  username: 用户名
         *  password: 密码
         *  code: 验证码
         *  uuid: 匹配正确验证码的 key
         */
        login(userInfo: { username: string, password: string, code: string, uuid: string }) {
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
                    this.SET_TOKEN(accessToken)
                    resolve(access_token)
                }).catch(error => {
                    reject(error)
                })
            })
        },
        /**
         *  获取用户信息（昵称、头像、角色集合、权限集合）
         */
        getUserInfo() {
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
                        this.SET_NICKNAME(nickname)
                        this.SET_AVATAR( avatar)
                        this.SET_ROLES( roles)
                        this.SET_PERMS( perms)

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
        logout() {
            return new Promise(((resolve, reject) => {
                logout().then(() => {
                    Local.remove('token')
                    this.RESET_STATE()
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
        resetToken(){
            return new Promise(resolve=>{
                Local.remove('token')
                this.RESET_STATE()
                resolve(null)
            })
        }
    }
})

export function useUserStoreHook() {
    return useUserStore(store);
}

