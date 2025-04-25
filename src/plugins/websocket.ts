import { useDictSync } from "@/hooks/websocket/services/useDictSync";
import { getAccessToken } from "@/utils/auth";

/**
 * 初始化WebSocket服务
 */
export function setupWebSocket() {
  console.log("[WebSocketPlugin] 开始初始化WebSocket服务...");

  // 检查token是否存在
  const token = getAccessToken();
  if (!token) {
    console.warn(
      "[WebSocketPlugin] 未找到访问令牌，WebSocket初始化已跳过。用户登录后将自动重新连接。"
    );
    return;
  }

  try {
    // 延迟初始化，确保应用完全启动
    setTimeout(() => {
      const dictWebSocket = useDictSync();

      // 初始化字典WebSocket服务
      dictWebSocket.initWebSocket();
      console.log("[WebSocketPlugin] 字典WebSocket初始化完成");

      // 在窗口关闭前断开WebSocket连接
      window.addEventListener("beforeunload", () => {
        console.log("[WebSocketPlugin] 窗口即将关闭，断开WebSocket连接");
        dictWebSocket.closeWebSocket();
      });

      console.log("[WebSocketPlugin] WebSocket服务初始化完成");
    }, 1000); // 延迟1秒初始化
  } catch (error) {
    console.error("[WebSocketPlugin] 初始化WebSocket服务失败:", error);
  }
}
