import { Storage } from "./storage";
import { AUTH_KEYS } from "@/constants";

// 负责本地凭证与偏好的读写
export const AuthStorage = {
  getAccessToken(): string {
    const isRememberMe = Storage.get<boolean>(AUTH_KEYS.REMEMBER_ME, false);
    return isRememberMe
      ? Storage.get(AUTH_KEYS.ACCESS_TOKEN, "")
      : Storage.sessionGet(AUTH_KEYS.ACCESS_TOKEN, "");
  },

  getRefreshToken(): string {
    const isRememberMe = Storage.get<boolean>(AUTH_KEYS.REMEMBER_ME, false);
    return isRememberMe
      ? Storage.get(AUTH_KEYS.REFRESH_TOKEN, "")
      : Storage.sessionGet(AUTH_KEYS.REFRESH_TOKEN, "");
  },

  setTokens(accessToken: string, refreshToken: string, rememberMe: boolean): void {
    Storage.set(AUTH_KEYS.REMEMBER_ME, rememberMe);
    if (rememberMe) {
      Storage.set(AUTH_KEYS.ACCESS_TOKEN, accessToken);
      Storage.set(AUTH_KEYS.REFRESH_TOKEN, refreshToken);
    } else {
      Storage.sessionSet(AUTH_KEYS.ACCESS_TOKEN, accessToken);
      Storage.sessionSet(AUTH_KEYS.REFRESH_TOKEN, refreshToken);
      Storage.remove(AUTH_KEYS.ACCESS_TOKEN);
      Storage.remove(AUTH_KEYS.REFRESH_TOKEN);
    }
  },

  clearAuth(): void {
    Storage.remove(AUTH_KEYS.ACCESS_TOKEN);
    Storage.remove(AUTH_KEYS.REFRESH_TOKEN);
    Storage.sessionRemove(AUTH_KEYS.ACCESS_TOKEN);
    Storage.sessionRemove(AUTH_KEYS.REFRESH_TOKEN);
  },

  getRememberMe(): boolean {
    return Storage.get<boolean>(AUTH_KEYS.REMEMBER_ME, false);
  },
};
