import { useDictStoreHook } from "@/store/modules/dict";
import { useSse } from "./useSse";

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
  const sse = useSse();

  // 消息回调函数列表
  const messageCallbacks = ref<DictChangeCallback[]>([]);

  // 取消订阅函数
  let unsubscribe: (() => void) | null = null;

  /**
   * 处理字典变更事件
   */
  const handleDictChangeMessage = (data: DictChangeMessage) => {
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
  };

  /**
   * 初始化 SSE 连接并订阅字典事件
   */
  const initialize = () => {
    // 建立 SSE 连接
    sse.connect();

    // 订阅字典变更事件
    unsubscribe = sse.on("dict", handleDictChangeMessage);
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
    isConnected: sse.isConnected,
    connectionState: sse.connectionState,

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
