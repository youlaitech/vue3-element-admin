import { defineStore } from "pinia";

import { loginApi, logoutApi } from "@/api/auth";
import { getUserInfo } from "@/api/user";
import { resetRouter } from "@/router";
import { store } from "@/store";

import { LoginData } from "@/api/auth/types";
import { UserInfo } from "@/api/user/types";

import { useStorage } from "@vueuse/core";

export const useUserStore = defineStore("user", () => {
  const user: UserInfo = {
    roles: [],
    perms: [],
  };

  const token = useStorage("accessToken", "");

  /**
   * 登录
   *
   * @param {LoginData}
   * @returns
   */
  function login(loginData: LoginData) {
    return new Promise<void>((resolve, reject) => {
      loginApi(loginData)
        .then((response) => {
          const { tokenType, accessToken } = response.data;
          token.value = tokenType + " " + accessToken; // Bearer eyJhbGciOiJIUzI1NiJ9.xxx.xxx
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  // 获取信息(用户昵称、头像、角色集合、权限集合)
  function getInfo() {
    return new Promise<UserInfo>((resolve, reject) => {
      getUserInfo()
        .then(({ data }) => {
          if (!data) {
            reject("Verification failed, please Login again.");
            return;
          }
          if (!data.roles || data.roles.length <= 0) {
            reject("getUserInfo: roles must be a non-null array!");
            return;
          }
          Object.assign(user, { ...data });
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  // 注销
  function logout() {
    return new Promise<void>((resolve, reject) => {
      logoutApi()
        .then(() => {
          resetStore();
          location.reload(); // 清空路由
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /** 清空缓存 */
  function resetStore() {
    resetRouter();
    token.value = "";
    Object.assign(user, { roles: [], perms: [] });
  }
  return {
    token,
    user,
    login,
    getInfo,
    logout,
    resetStore,
  };
});

// 非setup
export function useUserStoreHook() {
  return useUserStore(store);
}
