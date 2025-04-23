import { useWebSocketDict } from "@/hooks/useWebSocketDict";

/**
 * 初始化WebSocket服务
 */
export function setupWebSocket() {
  const dictWebSocket = useWebSocketDict();

  // 初始化字典WebSocket服务
  dictWebSocket.initWebSocket();
  console.log("字典WebSocket初始化完成");

  // 在窗口关闭前断开WebSocket连接
  window.addEventListener("beforeunload", () => {
    dictWebSocket.closeWebSocket();
  });
}
