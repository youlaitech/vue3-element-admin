import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from "axios";
import qs from "qs";

import { ApiCodeEnum } from "@/enums/api";
import { usePermissionStoreHook } from "@/stores/permission";
import { AuthStorage } from "@/utils/auth";
import type { ApiResult } from "@/api/common";
import { installTokenRefresh } from "@/utils/token-refresh";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  timeout: 50000,
  headers: { "Content-Type": "application/json;charset=utf-8" },
  // 数组参数序列化为 ids=1&ids=2，而非 ids[]=1&ids=2
  paramsSerializer: (params) => qs.stringify(params, { arrayFormat: "repeat" }),
});

// 注入访问令牌
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (!config.anonymous) {
      const token = AuthStorage.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 令牌续期拦截器：响应拦截器按注册顺序执行，先于业务拦截器接管 401，业务拦截器只负责业务错误的提示
installTokenRefresh(http);

// 解包业务数据
http.interceptors.response.use(
  (response: AxiosResponse<ApiResult>): AxiosResponse | any => {
    const { responseType } = response.config;

    // 二进制数据直接透传
    if (responseType === "blob" || responseType === "arraybuffer") {
      return response;
    }

    const { code, data, msg } = response.data;

    if (code === ApiCodeEnum.SUCCESS) {
      return data;
    }

    ElMessage.error(msg || "系统出错");
    return Promise.reject(new Error(msg || "系统出错"));
  },

  async (error) => {
    // 令牌续期拦截器已终结的错误（Token Invalid 等）不再提示
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const { response } = error;

    if (!response) {
      ElMessage.error("网络连接失败");
      return Promise.reject(error);
    }

    const { code, msg } = response.data as ApiResult;

    // 令牌失效：透传原始响应给续期拦截器处理，不在此提示
    if (code === ApiCodeEnum.ACCESS_TOKEN_INVALID || code === ApiCodeEnum.REFRESH_TOKEN_INVALID) {
      return Promise.reject(error);
    }

    // 权限不足：刷新权限后再提示
    if (code === ApiCodeEnum.PERMISSION_DENIED) {
      const permissionStore = usePermissionStoreHook();
      await permissionStore.refreshPermissions();
      ElMessage.error(msg || "权限不足");
      return Promise.reject(new Error(msg || "权限不足"));
    }

    ElMessage.error(msg || "请求失败");
    return Promise.reject(new Error(msg || "请求失败"));
  }
);

export default http;
