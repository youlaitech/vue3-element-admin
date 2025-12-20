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
