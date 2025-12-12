/**
 * 业务相关枚举
 *
 * @description
 * 包含菜单、用户、角色等业务实体的枚举定义
 */

/**
 * 菜单类型枚举
 */
export enum MenuTypeEnum {
  CATALOG = "C", // 目录
  MENU = "M", // 菜单
  BUTTON = "B", // 按钮
}

/**
 * 用户性别枚举
 */
export enum UserGender {
  /** 未知 */
  UNKNOWN = 0,
  /** 男 */
  MALE = 1,
  /** 女 */
  FEMALE = 2,
}

/**
 * 超级管理员角色标识
 *
 * @description
 * 拥有系统最高权限，可以访问所有资源
 */
export const ROLE_ROOT = "ROOT";

/**
 * 角色类型枚举
 */
export enum RoleType {
  /** 超级管理员 */
  ROOT = "ROOT",
  /** 管理员 */
  ADMIN = "ADMIN",
  /** 普通用户 */
  USER = "USER",
}
