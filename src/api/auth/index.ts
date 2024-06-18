import request from "@/utils/request";
import { CaptchaResult, LoginData, LoginResult } from "./model";

const AUTH_BASE_URL = "/api/v1/auth";

class AuthAPI {
  /**
   * 登录API
   *
   * @param data 登录数据
   * @returns 登录结果
   */
  static login(data: LoginData) {
    const formData = new FormData();
    formData.append("username", data.username);
    formData.append("password", data.password);
    formData.append("captchaKey", data.captchaKey || "");
    formData.append("captchaCode", data.captchaCode || "");
    return request<any, LoginResult>({
      url: `${AUTH_BASE_URL}/login`,
      method: "post",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  /**
   * 注销API
   *
   * @returns 请求结果
   */
  static logout() {
    return request({
      url: `${AUTH_BASE_URL}/logout`,
      method: "delete",
    });
  }

  /**
   * 获取验证码
   *
   * @returns 验证码结果
   */
  static getCaptcha() {
    return request<any, CaptchaResult>({
      url: `${AUTH_BASE_URL}/captcha`,
      method: "get",
    });
  }
}

export default AuthAPI;
