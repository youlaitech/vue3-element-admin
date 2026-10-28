/**
 * API 响应码枚举
 */
export const enum ApiCodeEnum {
  /** 成功 */
  SUCCESS = "00000",

  /** 访问令牌无效或过期 */
  ACCESS_TOKEN_INVALID = "A0230",

  /** 刷新令牌无效或过期 */
  REFRESH_TOKEN_INVALID = "A0231",

  /** 权限不足 */
  PERMISSION_DENIED = "A0301",

  /** 需要选择租户 */
  CHOOSE_TENANT = "A0250",

  /** 实时服务未启用 */
  REALTIME_DISABLED = "B0102",
}
