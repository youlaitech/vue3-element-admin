import type { InternalAxiosRequestConfig } from "axios";
import { useUserStoreHook } from "@/store/modules/user-store";
import { AuthStorage, redirectToLogin } from "@/utils/auth";

/**
 * 重试请求的回调函数类型
 */
type RetryCallback = () => void;

/**
 * Token刷新组合式函数
 */
export function useTokenRefresh() {
  // Token 刷新相关状态
  let isRefreshingToken = false;
  const pendingRequests: RetryCallback[] = [];

  /**
   * 刷新 Token 并重试请求
   */
  async function refreshTokenAndRetry(
    config: InternalAxiosRequestConfig,
    httpRequest: any
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      // 封装需要重试的请求
      const retryRequest = () => {
        const newToken = AuthStorage.getAccessToken();
        if (newToken && config.headers) {
          config.headers.Authorization = `Bearer ${newToken}`;
        }
        httpRequest(config).then(resolve).catch(reject);
      };

      // 将请求加入等待队列
      pendingRequests.push(retryRequest);

      // 如果没有正在刷新，则开始刷新流程
      if (!isRefreshingToken) {
        isRefreshingToken = true;

        useUserStoreHook()
          .refreshToken()
          .then(() => {
            // 刷新成功，重试所有等待的请求
            pendingRequests.forEach((callback) => {
              try {
                callback();
              } catch (error) {
                console.error("Retry request error:", error);
              }
            });
            // 清空队列
            pendingRequests.length = 0;
          })
          .catch(async (error) => {
            console.error("Token refresh failed:", error);
            // 刷新失败，先 reject 所有等待的请求，再清空队列
            const failedRequests = [...pendingRequests];
            pendingRequests.length = 0;

            // 拒绝所有等待的请求
            failedRequests.forEach(() => {
              reject(new Error("Token refresh failed"));
            });

            // 跳转登录页
            await redirectToLogin("登录状态已失效，请重新登录");
          })
          .finally(() => {
            isRefreshingToken = false;
          });
      }
    });
  }

  /**
   * 获取刷新状态（用于外部判断）
   */
  function getRefreshStatus() {
    return {
      isRefreshing: isRefreshingToken,
      pendingCount: pendingRequests.length,
    };
  }

  return {
    refreshTokenAndRetry,
    getRefreshStatus,
  };
}
