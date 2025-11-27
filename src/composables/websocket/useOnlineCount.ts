import { ref, onMounted, onUnmounted, getCurrentInstance } from "vue";
import { useStomp } from "./useStomp";
import { registerWebSocketInstance } from "@/plugins/websocket";
import { AuthStorage } from "@/utils/auth";

/**
 * 在线用户数量消息结构
 */
interface OnlineCountMessage {
  count?: number;
  timestamp?: number;
}

/**
 * 全局单例实例
 */
let globalInstance: ReturnType<typeof createOnlineCountComposable> | null = null;

/**
 * 创建在线用户计数组合式函数（内部工厂函数）
 */
function createOnlineCountComposable() {
  // ==================== 状态管理 ====================
  const onlineUserCount = ref(0);
  const lastUpdateTime = ref(0);

  // ==================== WebSocket 客户端 ====================
  const stomp = useStomp({
    reconnectDelay: 15000,
    maxReconnectAttempts: 3,
    connectionTimeout: 10000,
    useExponentialBackoff: true,
    autoRestoreSubscriptions: true, // 自动恢复订阅
    debug: false,
  });

  // 在线用户计数主题
  const ONLINE_COUNT_TOPIC = "/topic/online-count";

  // 订阅 ID
  let subscriptionId: string | null = null;

  // 注册到全局实例管理器
  registerWebSocketInstance("onlineCount", stomp);

  /**
   * 处理在线用户数量消息
   */
  const handleOnlineCountMessage = (message: any) => {
    try {
      const data = message.body;
      const jsonData = JSON.parse(data) as OnlineCountMessage;

      // 支持两种消息格式
      // 1. 直接是数字: 42
      // 2. 对象格式: { count: 42, timestamp: 1234567890 }
      const count = typeof jsonData === "number" ? jsonData : jsonData.count;

      if (count !== undefined && !isNaN(count)) {
        onlineUserCount.value = count;
        lastUpdateTime.value = Date.now();
      } else {
        console.warn("[useOnlineCount] 收到无效的在线用户数:", data);
      }
    } catch (error) {
      console.error("[useOnlineCount] 解析在线用户数失败:", error);
    }
  };

  /**
   * 订阅在线用户计数主题
   */
  const subscribeToOnlineCount = () => {
    if (subscriptionId) {
      return;
    }

    // 订阅在线用户计数主题（useStomp 会处理重连后的订阅恢复）
    subscriptionId = stomp.subscribe(ONLINE_COUNT_TOPIC, handleOnlineCountMessage);
  };

  /**
   * 初始化 WebSocket 连接并订阅在线用户主题
   */
  const initialize = () => {
    // 检查 WebSocket 端点是否配置
    const wsEndpoint = import.meta.env.VITE_APP_WS_ENDPOINT;
    if (!wsEndpoint) {
      console.log("[useOnlineCount] 未配置 WebSocket 端点，跳过初始化");
      return;
    }

    // 检查令牌有效性
    const accessToken = AuthStorage.getAccessToken();
    if (!accessToken) {
      console.log("[useOnlineCount] 未检测到有效令牌，跳过初始化");
      return;
    }

    // 建立 WebSocket 连接
    stomp.connect();

    // 订阅主题
    subscribeToOnlineCount();
  };

  /**
   * 关闭 WebSocket 连接并清理资源
   */
  const cleanup = () => {
    // 取消订阅
    if (subscriptionId) {
      stomp.unsubscribe(subscriptionId);
      subscriptionId = null;
    }

    // 也可以通过主题地址取消订阅
    stomp.unsubscribeDestination(ONLINE_COUNT_TOPIC);

    // 断开连接
    stomp.disconnect();

    // 重置状态
    onlineUserCount.value = 0;
    lastUpdateTime.value = 0;
  };

  return {
    // 状态
    onlineUserCount: readonly(onlineUserCount),
    lastUpdateTime: readonly(lastUpdateTime),
    isConnected: stomp.isConnected,
    connectionState: stomp.connectionState,

    // 方法
    initialize,
    cleanup,

    // 别名方法（向后兼容）
    initWebSocket: initialize,
    closeWebSocket: cleanup,
  };
}

/**
 * 在线用户计数组合式函数（单例模式）
 *
 * 用于实时显示系统在线用户数量
 *
 * @param options 配置选项
 * @param options.autoInit 是否在组件挂载时自动初始化（默认 true）
 *
 * @example
 * ```ts
 * // 在组件中使用
 * const { onlineUserCount, isConnected } = useOnlineCount();
 *
 * // 手动控制初始化
 * const { onlineUserCount, initialize, cleanup } = useOnlineCount({ autoInit: false });
 * onMounted(() => initialize());
 * onUnmounted(() => cleanup());
 * ```
 */
export function useOnlineCount(options: { autoInit?: boolean } = {}) {
  const { autoInit = true } = options;

  // 获取或创建单例实例
  if (!globalInstance) {
    globalInstance = createOnlineCountComposable();
  }

  // 只在组件上下文中且 autoInit 为 true 时使用生命周期钩子
  const instance = getCurrentInstance();
  if (autoInit && instance) {
    onMounted(() => {
      // 只有在未连接时才尝试初始化
      if (!globalInstance!.isConnected.value) {
        globalInstance!.initialize();
      }
    });

    // 注意：不在卸载时关闭连接，保持全局连接
    onUnmounted(() => {});
  }

  return globalInstance;
}
