import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";

import { ApiCodeEnum } from "@/enums/api";
import { useUserStoreHook } from "@/stores/user";
import { AuthStorage } from "@/utils/auth";
import type { ApiResult } from "@/api/common";

// 携带续期重试标记，mergeConfig 会把它带进重试后的新 config
type RetryRequestConfig = InternalAxiosRequestConfig & { isRetried?: boolean };

/**
 * 注册令牌续期拦截器：过期自动续期并重试请求
 */
export function installTokenRefresh(http: AxiosInstance) {
  // 续期进行中时先等待完成，避免带旧令牌发出后再 401 重来；续期失败则继续用现有令牌
  http.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    if (config.anonymous) {
      return config;
    }

    await useUserStoreHook()
      .waitRefresh()
      .catch(() => {});

    const token = AuthStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  http.interceptors.response.use(undefined, async (error: AxiosError<ApiResult>) => {
    const { config, response } = error;

    // 网络错误交回基础拦截器提示
    if (!response) {
      return Promise.reject(error);
    }

    const { code } = response.data ?? {};

    // Token 过期
    if (code === ApiCodeEnum.ACCESS_TOKEN_INVALID) {
      const retryConfig = config as RetryRequestConfig | undefined;
      const userStore = useUserStoreHook();

      // 匿名请求已重试过、或本就不参与续期：直接退出登录
      if (!retryConfig || retryConfig.isRetried || retryConfig.anonymous) {
        await userStore.redirectToLogin("expired");
        return Promise.reject(new Error("Token Invalid"));
      }

      retryConfig.isRetried = true;

      try {
        await userStore.refreshTokenOnce();

        const token = AuthStorage.getAccessToken();
        if (!token) {
          throw new Error("续期未返回访问令牌");
        }

        retryConfig.headers.set("Authorization", `Bearer ${token}`);
        return http(retryConfig);
      } catch {
        await userStore.redirectToLogin("expired");
        return Promise.reject(new Error("Token refresh failed"));
      }
    }

    // Refresh token 失效
    if (code === ApiCodeEnum.REFRESH_TOKEN_INVALID) {
      await useUserStoreHook().redirectToLogin("expired");
      return Promise.reject(new Error("Token Invalid"));
    }

    // 其它错误交回基础拦截器处理
    return Promise.reject(error);
  });
}
