import { Storage } from "./storage";
import { STORAGE_KEYS } from "@/constants";
import { readonly, shallowRef } from "vue";

const sessionRevision = shallowRef(0);
// 标识登录会话变化，正常续期不递增，供异步回调判断是否仍属当前账号。
export const authSessionRevision = readonly(sessionRevision);
/**
 * 校验持久化值是否为字符串。
 */
const isString = (value: unknown): value is string => typeof value === "string";
/**
 * 校验持久化值是否为布尔值。
 */
const isBoolean = (value: unknown): value is boolean => typeof value === "boolean";

/**
 * 本地凭证与偏好读写
 */
export const AuthStorage = {
  /**
   * 读取访问令牌
   */
  getAccessToken(): string {
    const isRememberMe = Storage.get(STORAGE_KEYS.REMEMBER_ME, false, isBoolean);
    return isRememberMe
      ? Storage.get(STORAGE_KEYS.ACCESS_TOKEN, "", isString)
      : Storage.sessionGet(STORAGE_KEYS.ACCESS_TOKEN, "", isString);
  },

  /**
   * 读取刷新令牌
   */
  getRefreshToken(): string {
    const isRememberMe = Storage.get(STORAGE_KEYS.REMEMBER_ME, false, isBoolean);
    return isRememberMe
      ? Storage.get(STORAGE_KEYS.REFRESH_TOKEN, "", isString)
      : Storage.sessionGet(STORAGE_KEYS.REFRESH_TOKEN, "", isString);
  },

  /**
   * 按“记住我”选择凭证存储，并清理另一存储中的旧令牌。
   * renewing 表示当前会话续期，不递增会话版本。
   */
  setTokens(
    accessToken: string,
    refreshToken: string,
    rememberMe: boolean,
    renewing = false
  ): void {
    Storage.set(STORAGE_KEYS.REMEMBER_ME, rememberMe);
    if (rememberMe) {
      Storage.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      Storage.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      Storage.sessionRemove(STORAGE_KEYS.ACCESS_TOKEN);
      Storage.sessionRemove(STORAGE_KEYS.REFRESH_TOKEN);
    } else {
      Storage.sessionSet(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      Storage.sessionSet(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      Storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
      Storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
    }
    if (!renewing) sessionRevision.value += 1;
  },

  /**
   * 清空令牌
   */
  clearAuth(): void {
    Storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
    Storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
    Storage.sessionRemove(STORAGE_KEYS.ACCESS_TOKEN);
    Storage.sessionRemove(STORAGE_KEYS.REFRESH_TOKEN);
    sessionRevision.value += 1;
  },

  /**
   * 读取"记住我"偏好
   */
  getRememberMe(): boolean {
    return Storage.get(STORAGE_KEYS.REMEMBER_ME, false, isBoolean);
  },
};
