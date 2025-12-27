import { useDictStoreHook } from "@/store/modules/dict";
import { useStomp } from "./useStomp";
import type { IMessage } from "@stomp/stompjs";

/**
 * 字典变更消息结构
 */
export interface DictChangeMessage {
  /** 字典编码 */
  dictCode: string;
  /** 时间戳 */
  timestamp: number;
}

/**
 * 字典消息别名（向后兼容）
 */
export type DictMessage = DictChangeMessage;

/**
 * 字典变更事件回调函数类型
 */
export type DictChangeCallback = (message: DictChangeMessage) => void;

/**
 * 全局单例实例
 */
let singletonInstance: ReturnType<typeof createDictSyncComposable> | null = null;

/**
 * 创建字典同步组合式函数（内部工厂函数）
 */
function createDictSyncComposable() {
  const dictStore = useDictStoreHook();

  // 使用优化后的 useStomp
  const stomp = useStomp({
    reconnectDelay: 20000,
    connectionTimeout: 15000,
    useExponentialBackoff: false,
    maxReconnectAttempts: 3,
    autoRestoreSubscriptions: true, // 自动恢复订阅
    debug: false,
  });

  // 字典主题地址
  const DICT_TOPIC = "/topic/dict";

  // 消息回调函数列表
  const messageCallbacks = ref<DictChangeCallback[]>([]);

  // 订阅 ID（用于取消订阅）
  let subscriptionId: string | null = null;

  /**
   * 处理字典变更事件
   */
  const handleDictChangeMessage = (message: IMessage) => {
    if (!message.body) {
      return;
    }

    try {
      const data = JSON.parse(message.body) as DictChangeMessage;
      const { dictCode } = data;

      if (!dictCode) {
        console.warn("[DictSync] 收到无效的字典变更消息：缺少 dictCode");
        return;
      }

      // 清除缓存，等待按需加载
      dictStore.removeDictItem(dictCode);

      // 执行所有注册的回调函数
      messageCallbacks.value.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error("[DictSync] 回调函数执行失败:", error);
        }
      });
    } catch (error) {
      console.error("[DictSync] 解析字典变更消息失败:", error);
    }
  };

  /**
   * 初始化 WebSocket 连接并订阅字典主题
   */
  const initialize = () => {
    // 检查是否配置了 WebSocket 端点
    const wsEndpoint = import.meta.env.VITE_APP_WS_ENDPOINT;
    if (!wsEndpoint) {
      console.log("[DictSync] 未配置 WebSocket 端点，跳过字典同步功能");
      return;
    }

    // console.log("[DictSync] 初始化字典同步服务..."); // 高频日志已禁用

    // 建立 WebSocket 连接
    stomp.connect();

    // 订阅字典主题（useStomp 会自动处理重连后的订阅恢复）
    subscriptionId = stomp.subscribe(DICT_TOPIC, handleDictChangeMessage);

    // if (subscriptionId) {
    //   console.log(`[DictSync] 已订阅字典主题: ${DICT_TOPIC}`);
    // } else {
    //   console.log(`[DictSync] 暂存字典主题订阅，等待连接建立后自动订阅`);
    // }
  };

  /**
   * 关闭 WebSocket 连接并清理资源
   */
  const cleanup = () => {
    // 取消订阅（如果有的话）
    if (subscriptionId) {
      stomp.unsubscribe(subscriptionId);
      subscriptionId = null;
    }

    // 也可以通过主题地址取消订阅
    stomp.unsubscribeDestination(DICT_TOPIC);

    // 断开连接
    stomp.disconnect();

    // 清空回调列表
    messageCallbacks.value = [];
  };

  /**
   * 注册字典变更回调函数
   *
   * @param callback 回调函数
   * @returns 返回一个取消注册的函数
   */
  const onDictChange = (callback: DictChangeCallback) => {
    messageCallbacks.value.push(callback);

    // 返回取消注册的函数
    return () => {
      const index = messageCallbacks.value.indexOf(callback);
      if (index !== -1) {
        messageCallbacks.value.splice(index, 1);
      }
    };
  };

  return {
    // 状态
    isConnected: stomp.isConnected,
    connectionState: stomp.connectionState,

    // 方法
    initialize,
    cleanup,
    onDictChange,
  };
}

/**
 * 字典同步组合式函数（单例模式）
 *
 * 用于监听后端字典变更并自动同步到前端缓存
 *
 * @example
 * ```ts
 * const dictSync = useDictSync();
 *
 * // 初始化（通常在应用启动时调用）
 * dictSync.initialize();
 *
 * // 注册回调
 * const unsubscribe = dictSync.onDictChange((message) => {
 *   console.log('字典已更新:', message.dictCode);
 * });
 *
 * // 取消注册
 * unsubscribe();
 *
 * // 清理（在应用退出时调用）
 * dictSync.cleanup();
 * ```
 */
export function useDictSync() {
  if (!singletonInstance) {
    singletonInstance = createDictSyncComposable();
  }
  return singletonInstance;
}
