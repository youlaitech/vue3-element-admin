import { ref, onMounted, onUnmounted, getCurrentInstance } from "vue";
import { useSse } from "./useSse";

/**
 * 全局单例实例
 */
let globalInstance: ReturnType<typeof createOnlineCountComposable> | null = null;

/**
 * 创建在线用户计数组合式函数（内部工厂函数）
 */
function createOnlineCountComposable() {
  // 状态管理
  const onlineUserCount = ref(0);
  const lastUpdateTime = ref(0);

  // SSE 客户端
  const sse = useSse();

  // 取消订阅函数
  let unsubscribe: (() => void) | null = null;

  /**
   * 处理在线用户数量消息
   */
  const handleOnlineCountMessage = (count: number) => {
    if (count !== undefined && !isNaN(count)) {
      onlineUserCount.value = count;
      lastUpdateTime.value = Date.now();
    }
  };

  /**
   * 初始化 SSE 连接并订阅在线用户事件
   */
  const initialize = () => {
    // 建立 SSE 连接
    sse.connect();

    // 订阅在线用户计数事件
    unsubscribe = sse.on("online-count", handleOnlineCountMessage);
  };

  /**
   * 关闭 SSE 连接并清理资源
   */
  const cleanup = () => {
    // 取消订阅
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }

    // 重置状态
    onlineUserCount.value = 0;
    lastUpdateTime.value = 0;
  };

  return {
    // 状态
    onlineUserCount: readonly(onlineUserCount),
    lastUpdateTime: readonly(lastUpdateTime),
    isConnected: sse.isConnected,
    connectionState: sse.connectionState,

    // 方法
    initialize,
    cleanup,
  };
}

/**
 * 在线用户计数组合式函数（单例模式）
 *
 * 用于实时显示系统在线用户数量
 *
 * @example
 * ```ts
 * // 在组件中使用（推荐）
 * const { onlineUserCount, isConnected } = useOnlineCount();
 *
 * // 手动控制初始化（高级用法）
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

  // 组件级自动初始化（仅在组件上下文中生效）
  const instance = getCurrentInstance();
  if (autoInit && instance) {
    onMounted(() => {
      // 防止重复初始化：只有在未连接时才尝试初始化
      if (!globalInstance!.isConnected.value) {
        globalInstance!.initialize();
      }
    });

    // 注意：组件卸载时不关闭连接，保持全局连接
    onUnmounted(() => {
      // 全局连接由 cleanupSse() 统一管理
    });
  }

  return globalInstance;
}
