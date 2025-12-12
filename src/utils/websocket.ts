/**
 * WebSocket 服务管理
 *
 * @description
 * 统一管理应用中的所有 WebSocket 连接
 * - 字典同步 WebSocket
 * - 在线用户计数 WebSocket
 * - 其他业务 WebSocket
 *
 * @author 有来技术团队
 */

import { useDictSync } from "@/composables";
import { AuthStorage } from "@/utils/auth";

/**
 * WebSocket 服务实例约定接口
 */
type WebSocketService = {
  disconnect?: () => void;
  closeWebSocket?: () => void;
  cleanup?: () => void;
  [key: string]: any;
};

/**
 * 全局 WebSocket 实例管理
 */
const websocketInstances = new Map<string, WebSocketService>();

/**
 * 防止重复初始化的状态标记
 */
let isInitialized = false;
let dictWebSocketInstance: ReturnType<typeof useDictSync> | null = null;

/**
 * 注册 WebSocket 实例
 */
export function registerWebSocketInstance(key: string, instance: WebSocketService) {
  websocketInstances.set(key, instance);
}

/**
 * 获取 WebSocket 实例
 */
export function getWebSocketInstance(key: string) {
  return websocketInstances.get(key);
}

/**
 * 初始化 WebSocket 服务
 */
export function setupWebSocket() {
  if (isInitialized) {
    console.warn("[WebSocket] 已初始化，跳过重复初始化");
    return;
  }

  if (!AuthStorage.getAccessToken()) {
    console.warn("[WebSocket] 未登录，跳过 WebSocket 初始化");
    return;
  }

  try {
    dictWebSocketInstance = useDictSync();
    registerWebSocketInstance("dict-sync", dictWebSocketInstance);
    isInitialized = true;
    console.log("[WebSocket] 初始化成功");
  } catch (error) {
    console.error("[WebSocket] 初始化失败:", error);
  }
}

/**
 * 清理所有 WebSocket 连接
 */
export function cleanupWebSocket() {
  console.log("[WebSocket] 开始清理连接...");

  websocketInstances.forEach((instance, key) => {
    try {
      if (instance.disconnect) {
        instance.disconnect();
      } else if (instance.closeWebSocket) {
        instance.closeWebSocket();
      } else if (instance.cleanup) {
        instance.cleanup();
      }
      console.log(`[WebSocket] ${key} 已断开`);
    } catch (error) {
      console.error(`[WebSocket] ${key} 清理失败:`, error);
    }
  });

  websocketInstances.clear();
  dictWebSocketInstance = null;
  isInitialized = false;
  console.log("[WebSocket] 清理完成");
}

/**
 * 重新初始化 WebSocket
 */
export function reinitializeWebSocket() {
  cleanupWebSocket();
  setupWebSocket();
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    cleanupWebSocket();
  });
}
