import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from "axios";
import qs from "qs";
import { useUserStoreHook } from "@/store/modules/user";
import { ResultEnum } from "@/enums/ResultEnum";
import { getToken } from "@/utils/auth";
import router from "@/router";

// 创建 axios 实例
const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 50000,
  headers: { "Content-Type": "application/json;charset=utf-8" },
  paramsSerializer: (params) => qs.stringify(params),
});

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = getToken();
    // 如果 Authorization 设置为 no-auth，则不携带 Token，用于登录、刷新 Token 等接口
    if (config.headers.Authorization !== "no-auth" && accessToken) {
      config.headers.Authorization = accessToken;
    } else {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    // 如果响应是二进制流，则直接返回，用于下载文件、Excel 导出等
    if (response.config.responseType === "blob") {
      return response;
    }

    const { code, data, msg } = response.data;
    if (code === ResultEnum.SUCCESS) {
      return data;
    }

    ElMessage.error(msg || "系统出错");
    return Promise.reject(new Error(msg || "Error"));
  },
  async (error: any) => {
    const { config, response } = error;
    if (response) {
      const { code, msg } = response.data;
      if (code === ResultEnum.ACCESS_TOKEN_INVALID) {
        // Token 过期，刷新 Token
        return handleTokenRefresh(config);
      } else if (code === ResultEnum.REFRESH_TOKEN_INVALID) {
        return Promise.reject(new Error(msg || "Error"));
      } else {
        ElMessage.error(msg || "系统出错");
      }
    }
    return Promise.reject(error.message);
  }
);

export default service;

// 刷新 Token 的锁
let isRefreshing = false;
// 因 Token 过期导致失败的请求队列
let requestsQueue: Array<() => void> = [];

// 刷新 Token 处理
async function handleTokenRefresh(config: InternalAxiosRequestConfig) {
  return new Promise((resolve) => {
    const requestCallback = () => {
      config.headers.Authorization = getToken();
      resolve(service(config));
    };

    requestsQueue.push(requestCallback);

    if (!isRefreshing) {
      isRefreshing = true;

      // 刷新 Token
      useUserStoreHook()
        .refreshToken()
        .then(() => {
          // Token 刷新成功，执行请求队列
          requestsQueue.forEach((callback) => callback());
          requestsQueue = [];
        })
        .catch((error) => {
          console.log("handleTokenRefresh error", error);
          // Token 刷新失败，清除用户数据并跳转到登录
          ElNotification({
            title: "提示",
            message: "您的会话已过期，请重新登录",
            type: "info",
          });
          useUserStoreHook()
            .clearUserData()
            .then(() => {
              router.push("/login");
            });
        })
        .finally(() => {
          isRefreshing = false;
        });
    }
  });
}
