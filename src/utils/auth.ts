import { Storage } from "./storage";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, REMEMBER_ME_KEY } from "@/constants/cache-keys";

/**
 * 身份验证工具类
 * 集中管理所有与认证相关的功能，包括：
 * - 登录状态判断
 * - Token 的存取
 * - 记住我功能的状态管理
 */
export class Auth {
  /**
   * 判断用户是否已登录
   * @returns 是否已登录
   */
  static isLoggedIn(): boolean {
    return !!Auth.getAccessToken();
  }

  /**
   * 获取当前有效的访问令牌
   * 会根据"记住我"状态从适当的存储位置获取
   * @returns 当前有效的访问令牌
   */
  static getAccessToken(): string {
    const isRememberMe = Storage.get<boolean>(REMEMBER_ME_KEY, false);
    // 根据"记住我"状态决定从哪个存储位置获取token
    return isRememberMe
      ? Storage.get(ACCESS_TOKEN_KEY, "")
      : Storage.sessionGet(ACCESS_TOKEN_KEY, "");
  }

  /**
   * 获取刷新令牌
   * @returns 当前有效的刷新令牌
   */
  static getRefreshToken(): string {
    const isRememberMe = Storage.get<boolean>(REMEMBER_ME_KEY, false);
    return isRememberMe
      ? Storage.get(REFRESH_TOKEN_KEY, "")
      : Storage.sessionGet(REFRESH_TOKEN_KEY, "");
  }

  /**
   * 设置访问令牌和刷新令牌
   * @param accessToken 访问令牌
   * @param refreshToken 刷新令牌
   * @param rememberMe 是否记住我
   */
  static setTokens(accessToken: string, refreshToken: string, rememberMe: boolean): void {
    // 保存"记住我"状态
    Storage.set(REMEMBER_ME_KEY, rememberMe);

    if (rememberMe) {
      // 使用localStorage长期保存
      Storage.set(ACCESS_TOKEN_KEY, accessToken);
      Storage.set(REFRESH_TOKEN_KEY, refreshToken);
    } else {
      // 使用sessionStorage临时保存
      Storage.sessionSet(ACCESS_TOKEN_KEY, accessToken);
      Storage.sessionSet(REFRESH_TOKEN_KEY, refreshToken);
      // 清除localStorage中可能存在的token
      Storage.remove(ACCESS_TOKEN_KEY);
      Storage.remove(REFRESH_TOKEN_KEY);
    }
  }

  /**
   * 清除所有身份验证相关的数据
   */
  static clearAuth(): void {
    Storage.remove(ACCESS_TOKEN_KEY);
    Storage.remove(REFRESH_TOKEN_KEY);
    Storage.sessionRemove(ACCESS_TOKEN_KEY);
    Storage.sessionRemove(REFRESH_TOKEN_KEY);
    // 不清除记住我设置，保留用户偏好
  }

  /**
   * 获取"记住我"状态
   * @returns 是否记住我
   */
  static getRememberMe(): boolean {
    return Storage.get<boolean>(REMEMBER_ME_KEY, false);
  }
}
