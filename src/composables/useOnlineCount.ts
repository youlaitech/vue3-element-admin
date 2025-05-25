import { ref, onMounted, onUnmounted, watch, getCurrentInstance } from "vue";
import { useStomp } from "./useStomp";
import { registerWebSocketInstance } from "@/plugins/websocket";
import { Auth } from "@/utils/auth";

// 全局单例实例
let globalInstance: ReturnType<typeof createOnlineCountHook> | null = null;

/**
 * 创建在线用户计数的核心逻辑
 */
function createOnlineCountHook() {
  // 在线用户数量
  const onlineUserCount = ref(0);

  // 最后更新时间戳
  const lastUpdateTime = ref(0);

  // 连接状态
  const isConnected = ref(false);

  // 连接正在尝试中
  const isConnecting = ref(false);

  // 使用Stomp客户端 - 配置使用指数退避策略
  const stompInstance = useStomp({
    reconnectDelay: 15000, // 重连基础延迟
    maxReconnectAttempts: 3, // 重连次数上限
    connectionTimeout: 10000, // 连接超时
    useExponentialBackoff: true, // 启用指数退避
  });

  const {
    connect,
    subscribe,
    unsubscribe,
    disconnect,
    isConnected: stompConnected,
  } = stompInstance;

  // 注册到全局实例管理器
  registerWebSocketInstance("onlineCount", stompInstance);

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
      console.log("[useOnlineCount] WebSocket连接成功，已订阅在线用户计数主题");
    }
  });

  /**
   * 订阅在线用户计数主题
   */
  const subscribeToOnlineCount = () => {
    if (!stompConnected.value) {
      // 10秒后重试订阅
      setTimeout(subscribeToOnlineCount, 10000);
      return;
    }

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
        console.error("[useOnlineCount] 解析在线用户数量失败:", error);
      }
    });
  };

  /**
   * 初始化WebSocket连接并订阅在线用户主题
   */
  const initWebSocket = () => {
    if (isConnecting.value) return;

    // 检查WebSocket端点是否配置
    const wsEndpoint = import.meta.env.VITE_APP_WS_ENDPOINT;
    if (!wsEndpoint) {
      console.log("[useOnlineCount] 未配置WebSocket端点(VITE_APP_WS_ENDPOINT),跳过WebSocket连接");
      return;
    }

    // 使用 Auth.getAccessToken() 获取令牌，确保获取到最新的
    const accessToken = Auth.getAccessToken();
    if (!accessToken) {
      console.log("[useOnlineCount] 没有检测到有效令牌，不尝试WebSocket连接");
      return;
    }

    isConnecting.value = true;
    console.log("[useOnlineCount] 开始建立WebSocket连接...");

    // 连接WebSocket
    connect();

    // 设置连接超时显示UI提示
    clearTimeout(connectionTimeoutTimer);
    connectionTimeoutTimer = setTimeout(() => {
      if (!isConnected.value) {
        console.warn("[useOnlineCount] WebSocket连接超时，将自动尝试重连");
        ElMessage.warning("正在尝试连接服务器，请稍候...");

        // 超时后尝试重新连接
        closeWebSocket();
        setTimeout(() => {
          // 再次检查令牌有效性
          if (Auth.getAccessToken()) {
            initWebSocket();
          } else {
            console.log("[useOnlineCount] 令牌无效，放弃重连");
          }
        }, 3000);
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

  return {
    onlineUserCount,
    lastUpdateTime,
    isConnected,
    isConnecting,
    initWebSocket,
    closeWebSocket,
  };
}

/**
 * 在线用户计数组合式函数
 * 使用单例模式，避免重复创建 WebSocket 连接
 * @param options 配置选项
 * @param options.autoInit 是否在组件挂载时自动初始化（默认 true）
 */
export function useOnlineCount(options: { autoInit?: boolean } = {}) {
  const { autoInit = true } = options;

  if (!globalInstance) {
    globalInstance = createOnlineCountHook();
  }

  // 只有在组件上下文中且 autoInit 为 true 时才使用生命周期钩子
  if (autoInit && getCurrentInstance()) {
    // 组件挂载时检查是否需要初始化WebSocket
    onMounted(() => {
      // 只有在未连接且未连接中时才尝试初始化
      if (!globalInstance!.isConnected.value && !globalInstance!.isConnecting.value) {
        console.log("[useOnlineCount] 组件挂载，尝试初始化WebSocket连接");
        globalInstance!.initWebSocket();
      } else {
        console.log("[useOnlineCount] WebSocket已连接或正在连接，跳过初始化");
      }
    });

    // 组件卸载时不关闭连接，保持全局连接
    onUnmounted(() => {
      // 不关闭连接，让其他组件继续使用
      console.log("[useOnlineCount] Component unmounted, keeping WebSocket connection");
    });
  }

  return globalInstance;
}
