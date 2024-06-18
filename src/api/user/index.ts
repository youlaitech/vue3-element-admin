import request from "@/utils/request";
import { UserForm, UserInfo, UserPageVO, UserQuery } from "./model";

const USER_BASE_URL = "/api/v1/users";

class UserAPI {
  /**
   * 登录成功后获取用户信息（昵称、头像、权限集合和角色集合）
   *
   * @returns 用户信息
   */
  static getInfo() {
    return request<any, UserInfo>({
      url: `${USER_BASE_URL}/me`,
      method: "get",
    });
  }

  /**
   * 获取用户分页列表
   *
   * @param queryParams 查询参数
   * @returns 用户分页列表
   */
  static getPage(queryParams: UserQuery) {
    return request<any, PageResult<UserPageVO[]>>({
      url: `${USER_BASE_URL}/page`,
      method: "get",
      params: queryParams,
    });
  }

  /**
   * 获取用户表单详情
   *
   * @param userId 用户ID
   * @returns 用户表单详情
   */
  static getFormData(userId: number) {
    return request<any, UserForm>({
      url: `${USER_BASE_URL}/${userId}/form`,
      method: "get",
    });
  }

  /**
   * 添加用户
   *
   * @param data 用户表单数据
   * @returns 请求结果
   */
  static add(data: UserForm) {
    return request({
      url: `${USER_BASE_URL}`,
      method: "post",
      data: data,
    });
  }

  /**
   * 修改用户
   *
   * @param id 用户ID
   * @param data 用户表单数据
   * @returns 请求结果
   */
  static update(id: number, data: UserForm) {
    return request({
      url: `${USER_BASE_URL}/${id}`,
      method: "put",
      data: data,
    });
  }

  /**
   * 修改用户密码
   *
   * @param id 用户ID
   * @param password 新密码
   * @returns 请求结果
   */
  static updatePassword(id: number, password: string) {
    return request({
      url: `${USER_BASE_URL}/${id}/password`,
      method: "patch",
      params: { password: password },
    });
  }

  /**
   * 批量删除用户，多个以英文逗号(,)分割
   *
   * @param ids 用户ID字符串，多个以英文逗号(,)分割
   * @returns 请求结果
   */
  static deleteByIds(ids: string) {
    return request({
      url: `${USER_BASE_URL}/${ids}`,
      method: "delete",
    });
  }

  /**
   * 下载用户导入模板
   *
   * @returns 用户导入模板文件
   */
  static downloadTemplate() {
    return request({
      url: `${USER_BASE_URL}/template`,
      method: "get",
      responseType: "arraybuffer",
    });
  }

  /**
   * 导出用户
   *
   * @param queryParams 查询参数
   * @returns 导出文件
   */
  static export(queryParams: UserQuery) {
    return request({
      url: `${USER_BASE_URL}/export`,
      method: "get",
      params: queryParams,
      responseType: "arraybuffer",
    });
  }

  /**
   * 导入用户
   *
   * @param deptId 部门ID
   * @param file 导入文件
   * @returns 请求结果
   */
  static import(deptId: number, file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return request({
      url: `${USER_BASE_URL}/import`,
      method: "post",
      params: { deptId: deptId },
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }
}

export default UserAPI;
