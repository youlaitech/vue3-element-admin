import { ref, onMounted, onUnmounted, watch } from "vue";
import { useStomp } from "../core/useStomp";
import { ElMessage } from "element-plus";

/**
 * 在线用户计数Hook
 * 用于订阅后端推送的在线用户数量变化
 */
export function useOnlineCount() {
  // 在线用户数量
  const onlineUserCount = ref(0);

  // 最后更新时间戳
  const lastUpdateTime = ref(0);

  // 连接状态
  const isConnected = ref(false);

  // 连接正在尝试中
  const isConnecting = ref(false);

  // 使用Stomp客户端 - 配置使用指数退避策略
  const {
    connect,
    subscribe,
    unsubscribe,
    disconnect,
    isConnected: stompConnected,
  } = useStomp({
    reconnectDelay: 5000, // 初始重连延迟5秒
    maxReconnectAttempts: 3, // 最大重连3次
    connectionTimeout: 10000, // 连接超时10秒
    useExponentialBackoff: true, // 启用指数退避
  });

  // 订阅ID
  let subscriptionId = "";

  // 连接超时计时器
  let connectionTimeoutTimer: any = null;

  // 监听Stomp连接状态
  watch(stompConnected, (connected) => {
    if (connected && isConnecting.value) {
      isConnected.value = true;
      isConnecting.value = false;

      // 一旦连接成功，立即订阅主题
      subscribeToOnlineCount();
      console.log("WebSocket连接成功，已订阅在线用户计数主题");
    }
  });

  /**
   * 订阅在线用户计数主题
   */
  const subscribeToOnlineCount = () => {
    if (!stompConnected.value) return;

    // 如果已经订阅，先取消订阅
    if (subscriptionId) {
      unsubscribe(subscriptionId);
    }

    // 订阅在线用户计数主题
    subscriptionId = subscribe("/topic/online-count", (message) => {
      try {
        const data = message.body;

        const jsonData = JSON.parse(data);
        const count = typeof jsonData === "number" ? jsonData : jsonData.count;

        if (!isNaN(count)) {
          onlineUserCount.value = count;
          lastUpdateTime.value = Date.now();
        }
      } catch (error) {
        console.error("解析在线用户数量失败:", error);
      }
    });
  };

  /**
   * 初始化WebSocket连接并订阅在线用户主题
   */
  const initWebSocket = () => {
    if (isConnecting.value) return;

    isConnecting.value = true;

    // 连接WebSocket
    connect();

    // 设置连接超时显示UI提示
    connectionTimeoutTimer = setTimeout(() => {
      if (!isConnected.value) {
        console.warn("WebSocket连接超时，将自动尝试重连");
        ElMessage.warning("正在尝试连接服务器，请稍候...");
      }
    }, 10000); // 较长的UI提示超时

    // 监听连接状态变化，连接成功后清除超时计时器
    const unwatch = watch(stompConnected, (connected) => {
      if (connected) {
        clearTimeout(connectionTimeoutTimer);
        unwatch();
      }
    });
  };

  /**
   * 关闭WebSocket连接
   */
  const closeWebSocket = () => {
    if (subscriptionId) {
      unsubscribe(subscriptionId);
      subscriptionId = "";
    }

    // 清除连接超时计时器
    if (connectionTimeoutTimer) {
      clearTimeout(connectionTimeoutTimer);
      connectionTimeoutTimer = null;
    }

    disconnect();
    isConnected.value = false;
    isConnecting.value = false;
  };

  // 组件挂载时初始化WebSocket
  onMounted(() => {
    initWebSocket();
  });

  // 组件卸载时关闭WebSocket
  onUnmounted(() => {
    closeWebSocket();
  });

  return {
    onlineUserCount,
    lastUpdateTime,
    isConnected,
    isConnecting,
    initWebSocket,
    closeWebSocket,
  };
}
