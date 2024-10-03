import request from "@/utils/request";
import { AxiosPromise, AxiosResponse } from "axios";

const USER_BASE_URL = "/api/v1/users";

class UserAPI {
  /**
   * 获取当前登录用户信息
   *
   * @returns 登录用户昵称、头像信息，包括角色和权限
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
   */
  static getPage(queryParams: UserPageQuery) {
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
   */
  static resetPassword(id: number, password: string) {
    return request({
      url: `${USER_BASE_URL}/${id}/password/reset`,
      method: "put",
      params: { password: password },
    });
  }

  /**
   * 批量删除用户，多个以英文逗号(,)分割
   *
   * @param ids 用户ID字符串，多个以英文逗号(,)分割
   */
  static deleteByIds(ids: string) {
    return request({
      url: `${USER_BASE_URL}/${ids}`,
      method: "delete",
    });
  }

  /** 下载用户导入模板 */
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
   */
  static export(queryParams: UserPageQuery) {
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

  /** 获取个人中心用户信息 */
  static getProfile() {
    return request<any, UserProfileVO>({
      url: `${USER_BASE_URL}/profile`,
      method: "get",
    });
  }

  /** 修改个人中心用户信息 */
  static updateProfile(data: UserProfileForm) {
    return request({
      url: `${USER_BASE_URL}/profile`,
      method: "put",
      data: data,
    });
  }

  /** 修改个人中心用户密码 */
  static changePassword(data: PasswordChangeForm) {
    return request({
      url: `${USER_BASE_URL}/password`,
      method: "put",
      data: data,
    });
  }

  /**
   *   发送手机/邮箱验证码
   *
   * @param contact 联系方式  手机号/邮箱
   * @param contactType 联系方式类型 MOBILE:手机;EMAIL:邮箱
   */
  static sendVerificationCode(contact: string, contactType: string) {
    return request({
      url: `${USER_BASE_URL}/send-verification-code`,
      method: "get",
      params: { contact: contact, contactType: contactType },
    });
  }

  /** 绑定个人中心用户手机 */
  static bindMobile(data: MobileBindingForm) {
    return request({
      url: `${USER_BASE_URL}/mobile`,
      method: "put",
      data: data,
    });
  }

  /** 绑定个人中心用户邮箱 */
  static bindEmail(data: EmailBindingForm) {
    return request({
      url: `${USER_BASE_URL}/email`,
      method: "put",
      data: data,
    });
  }

  /**
   *  获取用户下拉列表
   */
  static getOptions() {
    return request<any, OptionType[]>({
      url: `${USER_BASE_URL}/options`,
      method: "get",
    });
  }
}

export default UserAPI;

/** 登录用户信息 */
export interface UserInfo {
  /** 用户ID */
  userId?: number;

  /** 用户名 */
  username?: string;

  /** 昵称 */
  nickname?: string;

  /** 头像URL */
  avatar?: string;

  /** 角色 */
  roles: string[];

  /** 权限 */
  perms: string[];
}

/**
 * 用户分页查询对象
 */
export interface UserPageQuery extends PageQuery {
  /** 搜索关键字 */
  keywords?: string;

  /** 用户状态 */
  status?: number;

  /** 部门ID */
  deptId?: number;

  /** 开始时间 */
  createTime?: [string, string];
}

/** 用户分页对象 */
export interface UserPageVO {
  /** 用户头像URL */
  avatar?: string;
  /** 创建时间 */
  createTime?: Date;
  /** 部门名称 */
  deptName?: string;
  /** 用户邮箱 */
  email?: string;
  /** 性别 */
  genderLabel?: string;
  /** 用户ID */
  id?: number;
  /** 手机号 */
  mobile?: string;
  /** 用户昵称 */
  nickname?: string;
  /** 角色名称，多个使用英文逗号(,)分割 */
  roleNames?: string;
  /** 用户状态(1:启用;0:禁用) */
  status?: number;
  /** 用户名 */
  username?: string;
}

/** 用户表单类型 */
export interface UserForm {
  /** 用户头像 */
  avatar?: string;
  /** 部门ID */
  deptId?: number;
  /** 邮箱 */
  email?: string;
  /** 性别 */
  gender?: number;
  /** 用户ID */
  id?: number;
  /** 手机号 */
  mobile?: string;
  /** 昵称 */
  nickname?: string;
  /** 角色ID集合 */
  roleIds?: number[];
  /** 用户状态(1:正常;0:禁用) */
  status?: number;
  /** 用户名 */
  username?: string;
}

/** 个人中心用户信息 */
export interface UserProfileVO {
  /** 用户ID */
  id?: number;

  /** 用户名 */
  username?: string;

  /** 昵称 */
  nickname?: string;

  /** 头像URL */
  avatar?: string;

  /** 性别 */
  gender?: number;

  /** 手机号 */
  mobile?: string;

  /** 邮箱 */
  email?: string;

  /** 部门名称 */
  deptName?: string;

  /** 角色名称，多个使用英文逗号(,)分割 */
  roleNames?: string;

  /** 创建时间 */
  createTime?: Date;
}

/** 个人中心用户信息表单 */
export interface UserProfileForm {
  /** 用户ID */
  id?: number;

  /** 用户名 */
  username?: string;

  /** 昵称 */
  nickname?: string;

  /** 头像URL */
  avatar?: string;

  /** 性别 */
  gender?: number;

  /** 手机号 */
  mobile?: string;

  /** 邮箱 */
  email?: string;
}

/** 修改密码表单 */
export interface PasswordChangeForm {
  /** 原密码 */
  oldPassword?: string;
  /** 新密码 */
  newPassword?: string;
  /** 确认新密码 */
  confirmPassword?: string;
}

/** 修改手机表单 */
export interface MobileBindingForm {
  /** 手机号 */
  mobile?: string;
  /** 验证码 */
  code?: string;
}

/** 修改邮箱表单 */
export interface EmailBindingForm {
  /** 邮箱 */
  email?: string;
  /** 验证码 */
  code?: string;
}
