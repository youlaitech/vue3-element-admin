import { ElMessageBox } from "element-plus";

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

// 会话失效已处理，登录成功后复位
let sessionExpired = false;

// 连续续期失败上限
const MAX_REFRESH_FAILURES = 3;
// 连续续期失败次数
let refreshFailures = 0;

// 会话失效原因，决定弹窗提示文案
type RedirectReason = "expired" | "password-changed";

// 会话失效弹窗的提示文案
const SESSION_EXPIRED_TIPS: Record<RedirectReason, string> = {
  expired: "您的登录状态已过期，请重新登录",
  "password-changed": "您的密码已修改，请重新登录",
};

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
    refreshFailures = 0;
    sessionExpired = false;
  }

  /**
   * 扫码登录：用票据换取会话令牌
   */
  async function loginByQrCode(ticket: string): Promise<void> {
    const { accessToken, refreshToken } = await AuthAPI.qrLogin(ticket);
    AuthStorage.setTokens(accessToken, refreshToken, false);
    refreshFailures = 0;
    sessionExpired = false;
  }

  let refreshPromise: Promise<void> | null = null;

  /**
   * 刷新 token（单飞）：并发请求共享同一次 refresh
   */
  function refreshTokenOnce(): Promise<void> {
    if (refreshPromise) return refreshPromise;

    refreshPromise = doRefreshToken().finally(() => {
      refreshPromise = null;
    });

    return refreshPromise;
  }

  /**
   * 等待进行中的续期；无续期时立即返回
   */
  function waitRefresh(): Promise<void> {
    return refreshPromise ?? Promise.resolve();
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
   * 重置所有系统状态（凭证、路由、缓存、SSE）
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
   * 重置用户状态（仅用户模块内的，全局清理走 resetAllState）
   */
  function resetUserState(): void {
    AuthStorage.clearAuth();
    userInfo.value = {} as UserInfo;
  }

  /**
   * 会话失效的统一出口：弹窗提示，用户确认后清状态并跳登录页
   *
   * @param reason 失效原因，决定弹窗文案
   */ async function redirectToLogin(reason: RedirectReason = "expired"): Promise<void> {
    if (sessionExpired) return;
    sessionExpired = true;

    // 携带当前路由，登录成功后跳回
    const currentPath = router.currentRoute.value.fullPath;

    await ElMessageBox.alert(SESSION_EXPIRED_TIPS[reason], "提示", {
      type: "warning",
      confirmButtonText: "重新登录",
      // 只能点确认关闭，避免用户停在已失效的会话里继续操作
      showClose: false,
      closeOnClickModal: false,
      closeOnPressEscape: false,
    }).catch(() => {
      // 弹窗被异常销毁也要完成跳转
    });

    resetAllState();

    // 整页跳转：SPA 内 push 的导航被并发请求或守卫取消时不报错，页面会留在原地
    window.location.href = `${window.location.pathname}#/login?redirect=${encodeURIComponent(currentPath)}`;
    window.location.reload();
  }

  /**
   * 刷新 token
   */
  async function doRefreshToken(): Promise<void> {
    if (refreshFailures >= MAX_REFRESH_FAILURES) {
      throw new Error("令牌续期连续失败，请重新登录");
    }

    const currentRefreshToken = AuthStorage.getRefreshToken();

    if (!currentRefreshToken) {
      throw new Error("没有有效的刷新令牌");
    }

    try {
      const { accessToken, refreshToken: newRefreshToken } =
        await AuthAPI.refreshToken(currentRefreshToken);
      AuthStorage.setTokens(accessToken, newRefreshToken, AuthStorage.getRememberMe());
      refreshFailures = 0;
    } catch (error) {
      refreshFailures += 1;
      throw error;
    }
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
