/**
 * 通用对话框模式枚举
 * @description 定义对话框的操作模式（创建、编辑、查看）
 */
export enum DialogMode {
  /** 创建模式 - 新增数据 */
  CREATE = "create",
  /** 编辑模式 - 修改数据 */
  EDIT = "edit",
  /** 查看模式 - 只读展示 */
  VIEW = "view",
}
