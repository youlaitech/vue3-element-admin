import { store } from "@/stores";

import AuthAPI from "@/api/auth";
import UserAPI from "@/api/system/user";
import type { LoginRequest } from "@/api/auth";
import type { UserInfo } from "@/api/system/user";

import { AuthStorage } from "@/utils/auth";
import { usePermissionStoreHook } from "@/stores/permission";
import { useDictStoreHook } from "@/stores/dict";
import { useTagsViewStore } from "@/stores";
import { cleanupSse } from "@/utils/sse";
import router from "@/router";

// 防止并发会话失效触发重复跳转登录页
let redirectingToLogin = false;

export const useUserStore = defineStore("user", () => {
  // 用户信息
  const userInfo = ref<UserInfo>({} as UserInfo);
  // 记住我状态
  const rememberMe = ref(AuthStorage.getRememberMe());

  /**
   * 登录
   */
  async function login(loginRequest: LoginRequest): Promise<void> {
    const { accessToken, refreshToken } = await AuthAPI.login(loginRequest);
    rememberMe.value = loginRequest.rememberMe ?? false;
    AuthStorage.setTokens(accessToken, refreshToken, rememberMe.value);
  }

  /**
   * 扫码登录：用票据换取会话令牌
   */
  async function loginByQrCode(ticket: string): Promise<void> {
    const { accessToken, refreshToken } = await AuthAPI.qrLogin(ticket);
    AuthStorage.setTokens(accessToken, refreshToken, false);
  }

  let refreshPromise: Promise<void> | null = null;

  /**
   * 刷新 token（单飞模式）
   *
   * 多个并发请求遇到 token 过期时，共享同一次 refresh 请求。
   */
  function refreshTokenOnce(): Promise<void> {
    if (refreshPromise) return refreshPromise;

    refreshPromise = doRefreshToken().finally(() => {
      refreshPromise = null;
    });

    return refreshPromise;
  }

  /**
   * 获取用户信息
   */
  async function getUserInfo(): Promise<UserInfo> {
    const data = await UserAPI.getInfo();
    if (!data) {
      throw new Error("Verification failed, please Login again.");
    }
    Object.assign(userInfo.value, data);
    return data;
  }

  /**
   * 登出
   */
  async function logout(): Promise<void> {
    await AuthAPI.logout();
    resetAllState();
  }

  /**
   * 重置所有系统状态
   *
   * 统一处理所有清理工作，包括用户凭证、路由、缓存等
   */
  function resetAllState(): void {
    // 1. 重置用户状态
    resetUserState();

    // 2. 重置其他模块状态
    usePermissionStoreHook().resetRouter();
    useDictStoreHook().clearDictCache();
    useDictStoreHook().teardownDictSync();
    useTagsViewStore().delAllViews();

    // 3. 清理 SSE 连接
    cleanupSse();
  }

  /**
   * 重置用户状态
   *
   * 仅处理用户模块内的状态
   */
  function resetUserState(): void {
    AuthStorage.clearAuth();
    userInfo.value = {} as UserInfo;
  }

  /**
   * 会话失效的统一出口：通知用户、清理全局状态、携带当前路由跳转登录页
   *
   * @param message 通知文案
   * @param notify 是否弹出通知
   */
  async function redirectToLogin(
    message: string = "请重新登录",
    notify: boolean = true
  ): Promise<void> {
    if (redirectingToLogin) return;
    redirectingToLogin = true;

    try {
      if (notify) {
        ElNotification({
          title: "提示",
          message,
          type: "warning",
          duration: 3000,
        });
      }

      await resetAllState();

      // 跳转到登录页，保留当前路由用于登录后跳转
      const currentPath = router.currentRoute.value.fullPath;
      await router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
    } catch (error) {
      console.error("Redirect to login error:", error);
      // 强制跳转，即使路由重定向失败
      window.location.href = "/login";
    } finally {
      redirectingToLogin = false;
    }
  }

  /**
   * 刷新 token
   */
  async function doRefreshToken(): Promise<void> {
    const currentRefreshToken = AuthStorage.getRefreshToken();

    if (!currentRefreshToken) {
      throw new Error("没有有效的刷新令牌");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await AuthAPI.refreshToken(currentRefreshToken);
    AuthStorage.setTokens(accessToken, newRefreshToken, AuthStorage.getRememberMe());
  }

  return {
    userInfo,
    rememberMe,
    isLoggedIn: () => !!AuthStorage.getAccessToken(),
    login,
    loginByQrCode,
    logout,
    getUserInfo,
    resetAllState,
    resetUserState,
    redirectToLogin,
    refreshToken: doRefreshToken,
    refreshTokenOnce,
  };
});

/**
 * 在组件外部使用 UserStore 的钩子函数
 *
 * @see https://pinia.vuejs.org/core-concepts/outside-component-usage.html
 */
export function useUserStoreHook() {
  return useUserStore(store);
}
