import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from "axios";
import qs from "qs";
import { ApiCodeEnum } from "@/enums/api";
import { useUserStoreHook } from "@/store/modules/user";
import { AuthStorage, redirectToLogin } from "@/utils/auth";

// ============================================
// HTTP 请求实例
// ============================================

const http = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 50000,
  headers: { "Content-Type": "application/json;charset=utf-8" },
  paramsSerializer: (params) => qs.stringify(params),
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

    // 需要选择租户（特殊业务码，传递给调用方处理）
    if (code === ApiCodeEnum.CHOOSE_TENANT) {
      return Promise.reject({ code, data, msg });
    }

    ElMessage.error(msg || "系统出错");
    return Promise.reject(new Error(msg || "Error"));
  },

  async (error) => {
    const { config, response } = error;

    if (!response) {
      ElMessage.error("网络连接失败");
      return Promise.reject(error);
    }

    const { code, msg } = response.data as ApiResponse;

    // Token 过期处理
    if (code === ApiCodeEnum.ACCESS_TOKEN_INVALID) {
      return retryWithRefresh(config);
    }

    if (code === ApiCodeEnum.REFRESH_TOKEN_INVALID) {
      await redirectToLogin("登录已过期，请重新登录");
      return Promise.reject(new Error(msg || "Token Invalid"));
    }

    ElMessage.error(msg || "请求失败");
    return Promise.reject(new Error(msg || "Error"));
  }
);

export default http;

// ============================================
// Token 刷新重试
// ============================================

type Pending = { resolve: (v: unknown) => void; reject: (e: Error) => void };

let refreshing = false;
const queue: Pending[] = [];

async function retryWithRefresh(config: InternalAxiosRequestConfig): Promise<unknown> {
  return new Promise((resolve, reject) => {
    queue.push({ resolve, reject });

    if (refreshing) return;
    refreshing = true;

    useUserStoreHook()
      .refreshToken()
      .then(() => {
        const token = AuthStorage.getAccessToken();
        if (token) config.headers.Authorization = `Bearer ${token}`;

        queue.forEach(({ resolve }) => http(config).then(resolve).catch(reject));
      })
      .catch(async () => {
        queue.forEach(({ reject }) => reject(new Error("Token refresh failed")));
        await redirectToLogin("登录已过期，请重新登录");
      })
      .finally(() => {
        queue.length = 0;
        refreshing = false;
      });
  });
}
