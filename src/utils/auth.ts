import { Storage } from "./storage";
import { STORAGE_KEYS, ROLE_ROOT } from "@/constants";
import { useUserStoreHook } from "@/store/modules/user";
import router from "@/router";

// 负责本地凭证与偏好的读写
export const AuthStorage = {
  getAccessToken(): string {
    const isRememberMe = Storage.get<boolean>(STORAGE_KEYS.REMEMBER_ME, false);
    return isRememberMe
      ? Storage.get(STORAGE_KEYS.ACCESS_TOKEN, "")
      : Storage.sessionGet(STORAGE_KEYS.ACCESS_TOKEN, "");
  },

  getRefreshToken(): string {
    const isRememberMe = Storage.get<boolean>(STORAGE_KEYS.REMEMBER_ME, false);
    return isRememberMe
      ? Storage.get(STORAGE_KEYS.REFRESH_TOKEN, "")
      : Storage.sessionGet(STORAGE_KEYS.REFRESH_TOKEN, "");
  },

  setTokens(accessToken: string, refreshToken: string, rememberMe: boolean): void {
    Storage.set(STORAGE_KEYS.REMEMBER_ME, rememberMe);
    if (rememberMe) {
      Storage.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      Storage.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    } else {
      Storage.sessionSet(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      Storage.sessionSet(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      Storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
      Storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
    }
  },

  clearAuth(): void {
    Storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
    Storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
    Storage.sessionRemove(STORAGE_KEYS.ACCESS_TOKEN);
    Storage.sessionRemove(STORAGE_KEYS.REFRESH_TOKEN);
  },

  getRememberMe(): boolean {
    return Storage.get<boolean>(STORAGE_KEYS.REMEMBER_ME, false);
  },
};

/**
 * 权限判断
 */
export function hasPerm(value: string | string[], type: "button" | "role" = "button"): boolean {
  const { roles, perms } = useUserStoreHook().userInfo;

  if (!roles || !perms) {
    return false;
  }

  // 超级管理员拥有所有权限
  if (type === "button" && roles.includes(ROLE_ROOT)) {
    return true;
  }

  const auths = type === "button" ? perms : roles;
  return typeof value === "string"
    ? auths.includes(value)
    : value.some((perm) => auths.includes(perm));
}

/**
 * 重定向到登录页面
 */
export async function redirectToLogin(message: string = "请重新登录"): Promise<void> {
  ElNotification({
    title: "提示",
    message,
    type: "warning",
    duration: 3000,
  });

  await useUserStoreHook().resetAllState();

  try {
    // 跳转到登录页，保留当前路由用于登录后跳转
    const currentPath = router.currentRoute.value.fullPath;
    await router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
  } catch (error) {
    console.error("Redirect to login error:", error);
    // 强制跳转，即使路由重定向失败
    window.location.href = "/login";
  }
}
