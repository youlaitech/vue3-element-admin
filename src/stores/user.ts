import { store } from "@/stores";

import AuthAPI from "@/api/auth";
import UserAPI from "@/api/system/user";
import type { LoginRequest } from "@/api/auth";
import type { UserInfo } from "@/api/system/user";

import { AuthStorage, authSessionRevision } from "@/utils/auth";
import { usePermissionStoreHook } from "@/stores/permission";
import { useDictStoreHook } from "@/stores/dict";
import { useTagsViewStore } from "@/stores";
import router from "@/router";

// 会话失效已处理，登录成功后复位
let sessionExpired = false;

/**
 * 创建未登录时的用户信息。
 */
const createEmptyUserInfo = (): UserInfo => ({ roles: [], perms: [] });

/**
 * 管理用户资料、登录会话和令牌续期。
 */
export const useUserStore = defineStore("user", () => {
  const userInfo = ref<UserInfo>(createEmptyUserInfo());
  const rememberMe = ref(AuthStorage.getRememberMe());

  /**
   * 登录
   */
  async function login(loginRequest: LoginRequest): Promise<void> {
    const { accessToken, refreshToken } = await AuthAPI.login(loginRequest);
    rememberMe.value = loginRequest.rememberMe ?? false;
    AuthStorage.setTokens(accessToken, refreshToken, rememberMe.value);
    sessionExpired = false;
  }

  /**
   * 扫码登录：用票据换取会话令牌
   */
  async function loginByQrCode(ticket: string): Promise<void> {
    const { accessToken, refreshToken } = await AuthAPI.qrLogin(ticket);
    AuthStorage.setTokens(accessToken, refreshToken, false);
    sessionExpired = false;
  }

  let refreshPromise: Promise<void> | null = null;
  // 新会话独立续期，不能等待上一账号尚未结束的任务。
  watch(
    authSessionRevision,
    () => {
      refreshPromise = null;
    },
    { flush: "sync" }
  );

  /**
   * 并发续期共享同一任务，完成后允许下一次续期。
   */
  function refreshTokenOnce(): Promise<void> {
    if (refreshPromise) return refreshPromise;

    const revision = authSessionRevision.value;
    const token = AuthStorage.getRefreshToken();
    /**
     * 合并续期并丢弃旧会话结果，支持 Web Locks 时跨标签页串行。
     */
    const refresh = async () => {
      if (revision !== authSessionRevision.value) throw new Error("登录会话已切换");
      const current = AuthStorage.getRefreshToken();
      if (current !== token) {
        if (current.split(".")[1] !== token.split(".")[1]) throw new Error("登录会话已切换");
        return;
      }
      await doRefreshToken();
    };
    const task = navigator.locks
      ? navigator.locks.request("youlai-auth-refresh", refresh)
      : refresh();
    const pending = task.finally(() => {
      // 旧会话的 finally 不能清除新会话已建立的续期任务。
      if (refreshPromise === pending) refreshPromise = null;
    });
    refreshPromise = pending;
    return pending;
  }

  /**
   * 等待进行中的续期；无续期时立即返回
   */
  function waitRefresh(): Promise<void> {
    return refreshPromise ?? Promise.resolve();
  }

  /**
   * 读取并替换当前会话的用户快照。
   */
  async function fetchUserInfo(): Promise<UserInfo> {
    const revision = authSessionRevision.value;
    const data = await UserAPI.getInfo();
    if (revision !== authSessionRevision.value) throw new Error("登录会话已切换");
    if (!data) {
      throw new Error("Verification failed, please Login again.");
    }
    userInfo.value = data;
    return data;
  }

  /**
   * 登出
   *
   * @returns 认证中心的统一登出地址；为空表示只退了本地
   */
  async function logout(): Promise<string | null> {
    const revision = authSessionRevision.value;
    try {
      const result = await AuthAPI.logout();
      return revision === authSessionRevision.value ? (result?.logoutUrl ?? null) : null;
    } finally {
      // 服务端退出失败也要清理本地状态，避免界面停留在已登录形态
      if (revision === authSessionRevision.value) resetAllState();
    }
  }

  /**
   * 重置凭证、路由和本地缓存。
   */
  function resetAllState(): void {
    // 1. 重置用户状态
    resetUserState();

    // 2. 重置其他模块状态
    usePermissionStoreHook().resetRouter();
    useDictStoreHook().clearDictCache();
    useTagsViewStore().delAllViews();
  }

  /**
   * 重置用户状态（仅用户模块内的，全局清理走 resetAllState）
   */
  function resetUserState(): void {
    AuthStorage.clearAuth();
    userInfo.value = createEmptyUserInfo();
  }

  /**
   * 会话失效的统一出口：清空状态并静默跳转登录页
   *
   * 整页 replace 避免回退到失效页面，redirect 用于登录后返回。
   */
  async function redirectToLogin(): Promise<void> {
    if (sessionExpired) return;
    sessionExpired = true;

    // 携带当前路由，登录成功后跳回
    const currentPath = router.currentRoute.value.fullPath;
    const loginHref = router.resolve({
      path: "/login",
      query: { redirect: currentPath },
    }).href;

    resetAllState();
    window.location.replace(loginHref);
  }

  /**
   * 刷新 token
   */
  async function doRefreshToken(): Promise<void> {
    const currentRefreshToken = AuthStorage.getRefreshToken();
    const revision = authSessionRevision.value;

    if (!currentRefreshToken) {
      throw new Error("没有有效的刷新令牌");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await AuthAPI.refreshToken(currentRefreshToken);
    // 续期期间可能切换账号，旧结果不得覆盖新凭证。
    if (revision !== authSessionRevision.value) throw new Error("登录会话已切换");
    if (currentRefreshToken !== AuthStorage.getRefreshToken()) throw new Error("登录凭证已更新");
    AuthStorage.setTokens(accessToken, newRefreshToken, AuthStorage.getRememberMe(), true);
  }

  return {
    userInfo,
    rememberMe,
    isLoggedIn: () => !!AuthStorage.getAccessToken(),
    login,
    loginByQrCode,
    logout,
    fetchUserInfo,
    resetAllState,
    resetUserState,
    isSessionExpired: () => sessionExpired,
    redirectToLogin,
    refreshTokenOnce,
    waitRefresh,
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
