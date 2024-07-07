/* 通知类型枚举 */
export const enum NoticeTypeEnum {
  /** 系统升级 */
  SYSTEM_UPGRADE = "SYSTEM_UPGRADE",
  /** 系统维护 */
  SYSTEM_MAINTENANCE = "SYSTEM_MAINTENANCE",
  /** 安全警告 */
  SECURITY_ALERT = "SECURITY_ALERT",
  /** 假期通知 */
  HOLIDAY_NOTICE = "HOLIDAY_NOTICE",
  /** 公司新闻 */
  COMPANY_NEWS = "COMPANY_NEWS",
  /** 其他通知 */
  OTHER = "OTHER",
}

// 定义标签映射
const NoticeTypeLabels: Record<NoticeTypeEnum, string> = {
  [NoticeTypeEnum.SYSTEM_UPGRADE]: "系统升级",
  [NoticeTypeEnum.SYSTEM_MAINTENANCE]: "系统维护",
  [NoticeTypeEnum.SECURITY_ALERT]: "安全警告",
  [NoticeTypeEnum.HOLIDAY_NOTICE]: "假期通知",
  [NoticeTypeEnum.COMPANY_NEWS]: "公司新闻",
  [NoticeTypeEnum.OTHER]: "其他通知",
};

// 导出获取标签函数
export const getNoticeLabel = (type: NoticeTypeEnum): string => {
  return NoticeTypeLabels[type] || "";
};
