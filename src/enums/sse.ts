/**
 * SSE 相关枚举
 *
 * @description
 * SSE 事件名枚举，与后端 SseTopics.java 一一对应
 */

/**
 * SSE 事件名枚举
 */
export const enum SseTopics {
  /** 字典变更事件 */
  DICT = "dict",
  /** 在线用户数事件 */
  ONLINE_USERS = "online-users",
  /** 系统消息事件 */
  SYSTEM = "system",
  /** 心跳事件 */
  PING = "ping",
  /** 通知事件 */
  NOTICE = "notice",
  /** 通知撤回事件 */
  NOTICE_REVOKE = "notice-revoke",
}
