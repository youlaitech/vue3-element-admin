/**
 * SSE 服务统一管理
 *
 * @description
 * 提供 SSE 服务的统一初始化和清理接口
 * - 字典同步服务
 * - 在线用户统计服务
 *
 * @author 有来技术团队
 */

import { useDictSync } from "./useDictSync";
import { useOnlineCount } from "./useOnlineCount";
import { cleanupSse } from "./useSse";

/**
 * 初始化所有 SSE 服务
 *
 * 应在应用启动时调用，统一初始化所有 SSE 连接
 *
 * @example
 * ```ts
 * // 在 main.ts 中调用
 * setupSse();
 * ```
 */
export function setupSse() {
  // 初始化字典同步服务
  const dictSync = useDictSync();
  dictSync.initialize();

  // 初始化在线用户统计服务
  const onlineCount = useOnlineCount();
  onlineCount.initialize();
}

/**
 * 清理所有 SSE 连接
 *
 * 应在用户登出时调用，释放所有 SSE 资源
 *
 * @example
 * ```ts
 * // 在 user store 的 logout 方法中调用
 * cleanupSseServices();
 * ```
 */
export function cleanupSseServices() {
  // 清理字典同步服务
  const dictSync = useDictSync();
  dictSync.cleanup();

  // 清理在线用户统计服务
  const onlineCount = useOnlineCount();
  onlineCount.cleanup();

  // 清理全局 SSE 实例
  cleanupSse();
}

// 导出所有 SSE 相关的 composables
export { useDictSync } from "./useDictSync";
export { useOnlineCount } from "./useOnlineCount";
export { useSse, cleanupSse, SseConnectionState } from "./useSse";
export type { DictMessage, DictChangeMessage, DictChangeCallback } from "./useDictSync";
