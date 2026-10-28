/**
 * 对话框操作模式。
 */
export enum DialogMode {
  /** 新增 */
  CREATE = "create",
  /** 编辑 */
  EDIT = "edit",
  /** 只读查看 */
  VIEW = "view",
}

/**
 * 通用启用状态。
 */
export enum CommonStatus {
  /** 禁用 */
  DISABLED = 0,
  /** 启用 */
  ENABLED = 1,
}
