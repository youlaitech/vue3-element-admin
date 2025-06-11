import { useDictSync } from "@/composables/useDictSync";
import { Auth } from "@/utils/auth";
// 不直接导入 store 或 userStore

// 全局 WebSocket 实例管理
const websocketInstances = new Map<string, any>();

// 用于防止重复初始化的状态标记
let isInitialized = false;
let dictWebSocketInstance: ReturnType<typeof useDictSync> | null = null;

/**
 * 注册 WebSocket 实例
 */
export function registerWebSocketInstance(key: string, instance: any) {
  websocketInstances.set(key, instance);
  console.log(`[WebSocketPlugin] Registered WebSocket instance: ${key}`);
}

/**
 * 获取 WebSocket 实例
 */
export function getWebSocketInstance(key: string) {
  return websocketInstances.get(key);
}

/**
 * 初始化WebSocket服务
 */
export function setupWebSocket() {
  console.log("[WebSocketPlugin] 开始初始化WebSocket服务...");

  // 检查是否已经初始化
  if (isInitialized) {
    console.log("[WebSocketPlugin] WebSocket服务已经初始化,跳过重复初始化");
    return;
  }

  // 检查环境变量是否配置
  const wsEndpoint = import.meta.env.VITE_APP_WS_ENDPOINT;
  if (!wsEndpoint) {
    console.log("[WebSocketPlugin] 未配置WebSocket端点,跳过WebSocket初始化");
    return;
  }

  // 检查是否已登录
  if (!Auth.isLoggedIn()) {
    console.warn(
      "[WebSocketPlugin] 未找到访问令牌，WebSocket初始化已跳过。用户登录后将自动重新连接。"
    );
    return;
  }

  try {
    // 延迟初始化，确保应用完全启动
    setTimeout(() => {
      // 保存实例引用
      dictWebSocketInstance = useDictSync();
      registerWebSocketInstance("dictSync", dictWebSocketInstance);

      // 初始化字典WebSocket服务
      dictWebSocketInstance.initWebSocket();
      console.log("[WebSocketPlugin] 字典WebSocket初始化完成");

      // 初始化在线用户计数WebSocket
      import("@/composables/useOnlineCount").then(({ useOnlineCount }) => {
        const onlineCountInstance = useOnlineCount({ autoInit: false });
        onlineCountInstance.initWebSocket();
        console.log("[WebSocketPlugin] 在线用户计数WebSocket初始化完成");
      });

      // 在窗口关闭前断开WebSocket连接
      window.addEventListener("beforeunload", handleWindowClose);

      console.log("[WebSocketPlugin] WebSocket服务初始化完成");
      isInitialized = true;
    }, 1000); // 延迟1秒初始化
  } catch (error) {
    console.error("[WebSocketPlugin] 初始化WebSocket服务失败:", error);
  }
}

/**
 * 处理窗口关闭
 */
function handleWindowClose() {
  console.log("[WebSocketPlugin] 窗口即将关闭，断开WebSocket连接");
  cleanupWebSocket();
}

/**
 * 清理WebSocket连接
 */
export function cleanupWebSocket() {
  // 清理字典 WebSocket
  if (dictWebSocketInstance) {
    try {
      dictWebSocketInstance.closeWebSocket();
      console.log("[WebSocketPlugin] 字典WebSocket连接已断开");
    } catch (error) {
      console.error("[WebSocketPlugin] 断开字典WebSocket连接失败:", error);
    }
  }

  // 清理所有注册的 WebSocket 实例
  websocketInstances.forEach((instance, key) => {
    try {
      if (instance && typeof instance.disconnect === "function") {
        instance.disconnect();
        console.log(`[WebSocketPlugin] ${key} WebSocket连接已断开`);
      } else if (instance && typeof instance.closeWebSocket === "function") {
        instance.closeWebSocket();
        console.log(`[WebSocketPlugin] ${key} WebSocket连接已断开`);
      }
    } catch (error) {
      console.error(`[WebSocketPlugin] 断开 ${key} WebSocket连接失败:`, error);
    }
  });

  // 清空实例映射
  websocketInstances.clear();

  // 移除事件监听器
  window.removeEventListener("beforeunload", handleWindowClose);

  // 重置状态
  dictWebSocketInstance = null;
  isInitialized = false;
}

/**
 * 重新初始化WebSocket（用于登录后重连）
 */
export function reinitializeWebSocket() {
  // 先清理现有连接
  cleanupWebSocket();

  // 延迟后重新初始化
  setTimeout(() => {
    setupWebSocket();
  }, 500);
}
