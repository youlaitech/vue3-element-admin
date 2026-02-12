import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from "axios";
import qs from "qs";
import { ApiCodeEnum } from "@/enums/api";
import { useUserStoreHook } from "@/store/modules/user";
import { usePermissionStoreHook } from "@/store/modules/permission";
import { AuthStorage, redirectToLogin } from "@/utils/auth";

// ============================================
// HTTP 请求实例
// ============================================

const http = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 50000,
  headers: { "Content-Type": "application/json;charset=utf-8" },
  paramsSerializer: (params) => qs.stringify(params, { arrayFormat: "repeat" }),
});

// ============================================
// 请求拦截器
// ============================================

http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = AuthStorage.getAccessToken();

    if (config.headers.Authorization === "no-auth") {
      delete config.headers.Authorization;
    } else if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================
// 响应拦截器
// ============================================

http.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // 二进制数据直接返回
    const { responseType } = response.config;
    if (responseType === "blob" || responseType === "arraybuffer") {
      return response;
    }

    const { code, data, msg } = response.data;

    if (code === ApiCodeEnum.SUCCESS) {
      return data;
    }
    return rejectWithMessage(msg, "系统出错");
  },

  async (error) => {
    const { config, response } = error;

    if (!response) {
      ElMessage.error("网络连接失败");
      return Promise.reject(error);
    }

    const { code, msg } = response.data as ApiResponse;

    // Token 过期：尝试刷新 token 后自动重试一次
    if (code === ApiCodeEnum.ACCESS_TOKEN_INVALID) {
      return retryWithRefresh(config);
    }

    // Refresh token 失效：无法续期，跳转登录
    if (code === ApiCodeEnum.REFRESH_TOKEN_INVALID) {
      await redirectToLogin("登录已过期，请重新登录");
      return Promise.reject(new Error(msg || "Token Invalid"));
    }

    // 权限不足：刷新权限快照（用户信息 + 动态路由）后提示
    if (code === ApiCodeEnum.PERMISSION_DENIED) {
      return handlePermissionDenied(msg);
    }

    return rejectWithMessage(msg, "请求失败");
  }
);

/**
 * 权限不足处理：刷新权限快照（用户信息 + 动态路由），并给出提示
 *
 * 刷新完成后仍然按失败处理，交由调用方的错误流处理
 */
async function handlePermissionDenied(msg?: string): Promise<never> {
  const permissionStore = usePermissionStoreHook();
  await permissionStore.reloadPermissionSnapshotOnce();
  return rejectWithMessage(msg, "权限不足");
}

/**
 * access token 过期后的自动续期与重试
 *
 * - 刷新 token 走单飞（userStore.refreshTokenOnce）
 * - 当前请求最多重试一次（__isTokenRetry 标记）
 */
async function retryWithRefresh(config: InternalAxiosRequestConfig): Promise<unknown> {
  const retryConfig = config as InternalAxiosRequestConfig & { __isTokenRetry?: boolean };
  if (retryConfig.__isTokenRetry) {
    await redirectToLogin("登录已过期，请重新登录");
    return Promise.reject(new Error("Token Invalid"));
  }
  retryConfig.__isTokenRetry = true;

  try {
    const userStore = useUserStoreHook();
    await userStore.refreshTokenOnce();

    const token = AuthStorage.getAccessToken();
    if (token) {
      retryConfig.headers = retryConfig.headers || ({} as any);
      (retryConfig.headers as any).Authorization = `Bearer ${token}`;
    }

    return http(retryConfig);
  } catch {
    await redirectToLogin("登录已过期，请重新登录");
    return Promise.reject(new Error("Token refresh failed"));
  }
}

/**
 * 统一处理业务错误提示并拒绝 Promise
 *
 * @param msg 错误消息内容
 * @param fallback 默认兜底消息
 */
function rejectWithMessage(msg: string | undefined, fallback: string): Promise<never> {
  const message = msg || fallback;
  ElMessage.error(message);
  return Promise.reject(new Error(message));
}

export default http;
