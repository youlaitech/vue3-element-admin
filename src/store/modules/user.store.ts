import { store } from "@/store";
import { usePermissionStoreHook } from "@/store/modules/permission.store";
import { useDictStoreHook } from "@/store/modules/dict.store";

import AuthAPI, { type LoginFormData } from "@/api/auth.api";
import UserAPI, { type UserInfo } from "@/api/system/user.api";

import { setAccessToken, setRefreshToken, getRefreshToken, clearToken } from "@/utils/auth";

export const useUserStore = defineStore("user", () => {
  const userInfo = useStorage<UserInfo>("userInfo", {} as UserInfo);

  /**
   * 登录
   *
   * @param {LoginFormData}
   * @returns
   */
  function login(LoginFormData: LoginFormData) {
    return new Promise<void>((resolve, reject) => {
      AuthAPI.login(LoginFormData)
        .then((data) => {
          const { accessToken, refreshToken } = data;
          setAccessToken(accessToken); // eyJhbGciOiJIUzI1NiJ9.xxx.xxx
          setRefreshToken(refreshToken);
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * 获取用户信息
   *
   * @returns {UserInfo} 用户信息
   */
  function getUserInfo() {
    return new Promise<UserInfo>((resolve, reject) => {
      UserAPI.getInfo()
        .then((data) => {
          if (!data) {
            reject("Verification failed, please Login again.");
            return;
          }
          Object.assign(userInfo.value, { ...data });
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * 登出
   */
  function logout() {
    return new Promise<void>((resolve, reject) => {
      AuthAPI.logout()
        .then(() => {
          clearSessionAndCache();
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * 刷新 token
   */
  function refreshToken() {
    const refreshToken = getRefreshToken();
    return new Promise<void>((resolve, reject) => {
      AuthAPI.refreshToken(refreshToken)
        .then((data) => {
          const { accessToken, refreshToken } = data;
          setAccessToken(accessToken);
          setRefreshToken(refreshToken);
          resolve();
        })
        .catch((error) => {
          console.log(" refreshToken  刷新失败", error);
          reject(error);
        });
    });
  }

  /**
   * 清除用户会话和缓存
   */
  function clearSessionAndCache() {
    return new Promise<void>((resolve) => {
      clearToken();
      usePermissionStoreHook().resetRouter();
      useDictStoreHook().clearDictCache();
      resolve();
    });
  }

  return {
    userInfo,
    getUserInfo,
    login,
    logout,
    clearSessionAndCache,
    refreshToken,
  };
});

/**
 * 用于在组件外部（如在Pinia Store 中）使用 Pinia 提供的 store 实例。
 * 官方文档解释了如何在组件外部使用 Pinia Store：
 * https://pinia.vuejs.org/core-concepts/outside-component-usage.html#using-a-store-outside-of-a-component
 */
export function useUserStoreHook() {
  return useUserStore(store);
}
