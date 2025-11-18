/**
 * 通用状态枚举
 * 适用于大多数业务实体的启用/禁用状态
 */
export enum CommonStatus {
  /** 禁用 */
  DISABLED = 0,
  /** 启用 */
  ENABLED = 1,
}

/**
 * 审核状态枚举
 */
export enum AuditStatus {
  /** 待审核 */
  PENDING = 0,
  /** 已通过 */
  APPROVED = 1,
  /** 已拒绝 */
  REJECTED = 2,
}
