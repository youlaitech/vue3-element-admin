import {
  isAxiosError,
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

import { ApiCodeEnum } from "@/enums/api";
import { useUserStoreHook } from "@/stores/user";
import { AuthStorage, authSessionRevision } from "@/utils/auth";
import { readBinaryApiResult } from "@/utils/http-response";
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
      config.sessionRevision = authSessionRevision.value;
      return config;
    }

    await useUserStoreHook()
      .waitRefresh()
      .catch(() => {});

    const token = AuthStorage.getAccessToken();
    config.sessionRevision = authSessionRevision.value;
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

    // 旧账号的失败响应不能触发当前账号续期或退出。
    if (
      config?.sessionRevision !== undefined &&
      config.sessionRevision !== authSessionRevision.value
    ) {
      return Promise.reject(new Error("登录会话已切换"));
    }

    try {
      const result = await readBinaryApiResult(response);
      if (result) response.data = result;
    } catch (cause) {
      error.cause ??= new Error("文件接口错误响应解析失败", { cause });
      return Promise.reject(error);
    }
    // 文件解码期间也可能切换账号，不能将旧请求重试到新会话。
    if (
      config?.sessionRevision !== undefined &&
      config.sessionRevision !== authSessionRevision.value
    ) {
      return Promise.reject(new Error("登录会话已切换"));
    }
    // 匿名登录和续期的失败由调用者处理，不影响当前会话。
    if (config?.anonymous) return Promise.reject(error);

    const { code } = response.data ?? {};
    // Token 过期
    if (code === ApiCodeEnum.ACCESS_TOKEN_INVALID) {
      const retryConfig = config as RetryRequestConfig | undefined;
      const userStore = useUserStoreHook();

      // 缺少重试配置或已重试过时终止续期，防止循环请求。
      if (!retryConfig || retryConfig.isRetried || retryConfig.anonymous) {
        await userStore.redirectToLogin();
        return Promise.reject(new Error("Token Invalid"));
      }

      retryConfig.isRetried = true;

      try {
        // 晚到的 401 可能使用了续期前的令牌，无须再次轮换。
        if (retryConfig.headers.get("Authorization") === `Bearer ${AuthStorage.getAccessToken()}`) {
          await userStore.refreshTokenOnce();
        }

        if (
          retryConfig.sessionRevision !== undefined &&
          retryConfig.sessionRevision !== authSessionRevision.value
        ) {
          return Promise.reject(new Error("登录会话已切换"));
        }

        const token = AuthStorage.getAccessToken();
        if (!token) {
          throw new Error("续期未返回访问令牌");
        }

        retryConfig.headers.set("Authorization", `Bearer ${token}`);
        return http(retryConfig);
      } catch (refreshError) {
        if (retryConfig.sessionRevision !== authSessionRevision.value) {
          return Promise.reject(new Error("登录会话已切换"));
        }
        // Redis 不可用或网络中断时保留凭证，交给请求层提示重试。
        if (isAxiosError(refreshError) && refreshError.response?.status !== 401) {
          return Promise.reject(refreshError);
        }
        await userStore.redirectToLogin();
        return Promise.reject(new Error("Token refresh failed"));
      }
    }

    // Refresh token 失效
    if (code === ApiCodeEnum.REFRESH_TOKEN_INVALID) {
      await useUserStoreHook().redirectToLogin();
      return Promise.reject(new Error("Token Invalid"));
    }

    // 其它错误交回基础拦截器处理
    return Promise.reject(error);
  });
}
