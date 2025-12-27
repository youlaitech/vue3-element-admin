/**
 * WebSocket 服务统一管理
 *
 * @description
 * 提供 WebSocket 服务的统一初始化和清理接口
 * - 字典同步服务
 * - 在线用户统计服务
 *
 * @author 有来技术团队
 */

import { useDictSync } from "./useDictSync";
import { useOnlineCount } from "./useOnlineCount";

/**
 * 初始化所有 WebSocket 服务
 *
 * 应在应用启动时调用，统一初始化所有 WebSocket 连接
 *
 * @example
 * ```ts
 * // 在 main.ts 中调用
 * setupWebSocket();
 * ```
 */
export function setupWebSocket() {
  // 初始化字典同步服务
  const dictSync = useDictSync();
  dictSync.initialize();

  // 初始化在线用户统计服务
  const onlineCount = useOnlineCount();
  onlineCount.initialize();
}

/**
 * 清理所有 WebSocket 连接
 *
 * 应在用户登出时调用，释放所有 WebSocket 资源
 *
 * @example
 * ```ts
 * // 在 user store 的 logout 方法中调用
 * cleanupWebSocket();
 * ```
 */
export function cleanupWebSocket() {
  // 清理字典同步服务
  const dictSync = useDictSync();
  dictSync.cleanup();

  // 清理在线用户统计服务
  const onlineCount = useOnlineCount();
  onlineCount.cleanup();
}

// 导出所有 WebSocket 相关的 composables
export { useDictSync } from "./useDictSync";
export { useOnlineCount } from "./useOnlineCount";
export { useStomp } from "./useStomp";
export type { DictMessage, DictChangeMessage, DictChangeCallback } from "./useDictSync";
