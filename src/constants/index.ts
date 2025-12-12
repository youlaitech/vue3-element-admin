/**
 * 常量统一导出
 * 
 * @deprecated 此文件已废弃，请使用以下路径：
 * - 存储键常量  @/config/storage
 * - 验证规则  @/utils/validators
 * - 角色常量  @/enums
 */

// 向后兼容导出
export * from "@/config/storage";
export { ROLE_ROOT } from "@/enums";
export { VALIDATORS } from "@/utils/validators";
