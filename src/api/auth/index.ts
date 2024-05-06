import request from "@/utils/request";
import { CaptchaResult, LoginData, LoginResult } from "./model";

class AuthAPI {
  /**
   * 登录API
   *
   * @param data {LoginData}
   * @returns
   */
  static login(data: LoginData) {
    const formData = new FormData();
    formData.append("username", data.username);
    formData.append("password", data.password);
    formData.append("captchaKey", data.captchaKey || "");
    formData.append("captchaCode", data.captchaCode || "");
    return request<any, LoginResult>({
      url: "/api/v1/auth/login",
      method: "post",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  /**
   * 注销API
   */
  static logout() {
    return request({
      url: "/api/v1/auth/logout",
      method: "delete",
    });
  }

  /**
   * 获取验证码
   */
  static getCaptcha() {
    return request<any, CaptchaResult>({
      url: "/api/v1/auth/captcha",
      method: "get",
    });
  }
}

export default AuthAPI;
