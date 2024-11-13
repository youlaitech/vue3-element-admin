import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from "axios";
import qs from "qs";
import { useUserStoreHook } from "@/store/modules/user";
import { ResultEnum } from "@/enums/ResultEnum";
import { getToken } from "@/utils/auth";

// 创建 axios 实例
const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 50000,
  headers: { "Content-Type": "application/json;charset=utf-8" },
  paramsSerializer: (params) => {
    return qs.stringify(params);
  },
});

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 如果设置了 "no-auth"，则不携带 Authorization 头，用于登录、刷新 token 等接口
    if (config.headers.Authorization === "no-auth") {
      delete config.headers.Authorization;
    } else {
      const accessToken = getToken();
      if (accessToken) {
        config.headers.Authorization = accessToken;
      }
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const { responseType } = response.config;

    // 如果响应类型是二进制数据（文件导出场景）, 则直接返回 response
    if (responseType === "blob") {
      return response;
    }

    const { code, data, msg } = response.data;
    if (code === ResultEnum.SUCCESS) {
      return data;
    }

    ElMessage.error(msg || "系统出错");
    return Promise.reject(new Error(msg || "Error"));
  },
  (error: any) => {
    // 异常处理 非 2xx 状态码 会进入这里
    if (error.response.data) {
      const { code, msg } = error.response.data;
      if (code === ResultEnum.TOKEN_INVALID) {
        ElNotification({
          title: "提示",
          message: "您的会话已过期，请重新登录",
          type: "info",
        });
        useUserStoreHook()
          .clearUserData()
          .then(() => {
            location.reload();
          });
      } else {
        ElMessage.error(msg || "系统出错");
      }
    }
    return Promise.reject(error.message);
  }
);

export default service;
