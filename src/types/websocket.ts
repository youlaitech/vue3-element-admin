/**
 * WebSocket相关类型定义
 */

/**
 * 字典WebSocket事件类型
 */
export interface DictWebSocketEvent {
  /** 事件类型：更新或删除 */
  type: "DICT_UPDATED" | "DICT_DELETED";
  /** 字典编码 */
  dictCode: string;
  /** 时间戳 */
  timestamp: number;
}
