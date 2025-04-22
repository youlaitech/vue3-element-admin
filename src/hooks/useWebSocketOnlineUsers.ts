import { ref, onMounted, onUnmounted, watch } from "vue";
import { useStomp } from "./useStomp";
import { ElMessage } from "element-plus";

export interface OnlineUserStats {
  type: string; // 事件类型
  count: number; // 当前在线用户数量
  users?: any[]; // 用户列表（可选）
  timestamp: number; // 时间戳
}

/**
 * 在线用户WebSocket Hook
 * 用于订阅后端推送的在线用户数量变化
 */
export function useWebSocketOnlineUsers() {
  // 在线用户数量
  const onlineUserCount = ref(0);

  // 最后更新时间戳
  const lastUpdateTime = ref(0);

  // 连接状态
  const isConnected = ref(false);

  // 连接正在尝试中
  const isConnecting = ref(false);

  // 使用Stomp客户端
  const { connect, subscribe, unsubscribe, disconnect, isConnected: stompConnected } = useStomp();

  // 订阅ID
  let subscriptionId = "";

  // 重连次数
  let reconnectCount = 0;
  // 最大重连次数
  const maxReconnectAttempts = 5;
  // 重连计时器
  let reconnectTimer: any = null;

  // 监听Stomp连接状态
  watch(stompConnected, (connected) => {
    if (connected && isConnecting.value) {
      isConnected.value = true;
      isConnecting.value = false;
      reconnectCount = 0;

      // 一旦连接成功，立即订阅主题
      subscribeToOnlineUsers();
      console.log("WebSocket连接成功，已订阅在线用户主题");
    }
  });

  /**
   * 订阅在线用户主题
   */
  const subscribeToOnlineUsers = () => {
    if (!stompConnected.value) return;

    // 如果已经订阅，先取消订阅
    if (subscriptionId) {
      unsubscribe(subscriptionId);
    }

    // 订阅在线用户主题
    subscriptionId = subscribe("/topic/online-users", (message) => {
      try {
        const data: OnlineUserStats = JSON.parse(message.body);

        // 只有在消息类型为ONLINE_USERS_CHANGE时更新数据
        if (data.type === "ONLINE_USERS_CHANGE") {
          onlineUserCount.value = data.count || 0;
          lastUpdateTime.value = data.timestamp || Date.now();
        }
      } catch (error) {
        console.error("解析在线用户数据失败:", error);
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

    // 设置连接超时
    const connectionTimeout = setTimeout(() => {
      if (!isConnected.value) {
        console.warn("WebSocket连接超时，尝试重连");
        attemptReconnect();
      }
    }, 5000);

    // 监听连接状态变化，连接成功后清除超时计时器
    const unwatch = watch(stompConnected, (connected) => {
      if (connected) {
        clearTimeout(connectionTimeout);
        unwatch();
      }
    });
  };

  /**
   * 尝试重新连接
   */
  const attemptReconnect = () => {
    if (reconnectCount >= maxReconnectAttempts) {
      console.error(`已达到最大重连次数(${maxReconnectAttempts})，停止重连`);
      isConnecting.value = false;
      ElMessage.error("WebSocket连接失败，请稍后刷新页面重试");
      return;
    }

    reconnectCount++;
    console.log(`尝试重连(${reconnectCount}/${maxReconnectAttempts})...`);

    // 使用指数退避策略增加重连间隔
    const delay = Math.min(1000 * Math.pow(2, reconnectCount), 30000);

    // 清除之前的计时器
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
    }

    // 设置重连计时器
    reconnectTimer = setTimeout(() => {
      connect();
    }, delay);
  };

  /**
   * 关闭WebSocket连接
   */
  const closeWebSocket = () => {
    if (subscriptionId) {
      unsubscribe(subscriptionId);
      subscriptionId = "";
    }

    // 清除重连计时器
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
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
