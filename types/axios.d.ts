import "axios";

declare module "axios" {
  interface AxiosRequestConfig {
    // 匿名请求：不注入访问令牌，也不触发令牌续期
    anonymous?: boolean;
  }
}
