/**
 * Notice 通知类型定义
 */

/** 通知分页查询参数 */
export interface NoticePageQuery extends PageQuery {
  /** 通知标题 */
  title?: string;
  /** 发布状态(0:草稿;1:已发布;2:已撤回) */
  publishStatus?: number;
  /** 是否已读(1:是;0:否) */
  isRead?: number;
}

/** 通知表单对象 */
export interface NoticeForm {
  /** 通知ID */
  id?: string;
  /** 通知标题 */
  title?: string;
  /** 通知内容 */
  content?: string;
  /** 通知类型 */
  type?: number;
  /** 通知等级 */
  level?: string;
  /** 发布状态(0:草稿;1:已发布;2:已撤回) */
  publishStatus?: number;
  /** 目标用户ID(多个以英文逗号(,)分割) */
  targetUserIds?: string;
  /** 目标类型 (1:全部,2:指定用户等) */
  targetType?: number;
}

/** 通知分页对象 */
export interface NoticePageVo {
  /** 通知ID */
  id: string;
  /** 通知标题 */
  title: string;
  /** 通知内容 */
  content: string;
  /** 通知类型 */
  type: number;
  /** 通知等级 */
  level: string;
  /** 发布状态 */
  publishStatus: number;
  /** 是否已读 */
  isRead: number;
  /** 发布时间 */
  publishTime?: Date;
  /** 撤回时间 */
  revokeTime?: Date;
}

/** 通知详情对象 */
export interface NoticeDetailVo {
  /** 通知ID */
  id?: string;
  /** 通知标题 */
  title?: string;
  /** 通知内容 */
  content?: string;
  /** 通知类型 */
  type?: number;
  /** 通知等级 */
  level?: string;
  /** 发布状态 */
  publishStatus?: number;
  /** 目标用户ID */
  targetUserIds?: string;
  /** 发布人名称 */
  publisherName?: string;
  /** 发布时间 */
  publishTime?: Date;
}
