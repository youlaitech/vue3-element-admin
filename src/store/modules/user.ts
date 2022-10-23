import { defineStore } from 'pinia';
import { LoginFormData } from '@/types/api/user';
import { UserState } from '@/types/store/user';

import { localStorage } from '@/utils/storage';
import { login, logout } from '@/api/auth';
import { getUserInfo } from '@/api/user';

import { resetRouter } from '@/router';

const useUserStore = defineStore({
  id: 'user',
  state: (): UserState => ({
    token: localStorage.get('token') || '',
    nickname: '',
    avatar: '',
    roles: [],
    perms: []
  }),
  actions: {
    async RESET_STATE() {
      this.$reset();
    },
    /**
     * 登录 login
     */
    login(loginData: LoginFormData) {
      const { username, password } = loginData;
      return new Promise((resolve, reject) => {
        login({
          grant_type: 'password',
          username: username.trim(),
          password: password
        })
          .then(response => {
            console.log('response.data', response.data);
            const accessToken = response.data;
            localStorage.set('token', accessToken);
            this.token = accessToken;
            resolve(accessToken);
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    /**
     *  获取用户信息（昵称、头像、角色集合、权限集合）
     */
    getUserInfo() {
      return new Promise((resolve, reject) => {
        getUserInfo()
          .then(({ data }) => {
            if (!data) {
              return reject('Verification failed, please Login again.');
            }
            const { nickname, avatar, roles, perms } = data;
            if (!roles || roles.length <= 0) {
              reject('getUserInfo: roles must be a non-null array!');
            }
            this.nickname = nickname;
            this.avatar = avatar;
            this.roles = roles;
            this.perms = perms;
            resolve(data);
          })
          .catch(error => {
            console.log('error', error);
            reject(error);
          });
      });
    },

    /**
     *  注销
     */
    logout() {
      return new Promise((resolve, reject) => {
        logout()
          .then(() => {
            localStorage.remove('token');
            this.RESET_STATE();
            resetRouter();
            resolve(null);
          })
          .catch(error => {
            reject(error);
          });
      });
    },

    /**
     * 清除 Token
     */
    resetToken() {
      return new Promise(resolve => {
        localStorage.remove('token');
        this.RESET_STATE();
        resolve(null);
      });
    }
  }
});

export default useUserStore;
