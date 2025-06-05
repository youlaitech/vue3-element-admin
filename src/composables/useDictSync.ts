import { useDictStoreHook } from "@/store/modules/dict.store";
import { useStomp } from "./useStomp";
import type { IMessage } from "@stomp/stompjs";
import { ref } from "vue";

// 字典消息类型
export interface DictMessage {
  dictCode: string;
  timestamp: number;
}

// 字典事件回调类型
export type DictMessageCallback = (_message: DictMessage) => void;

// 全局单例实例
let instance: ReturnType<typeof createDictSyncHook> | null = null;

/**
 * 创建字典同步组合式函数
 * 负责监听后端字典变更并同步到前端
 */
function createDictSyncHook() {
  const dictStore = useDictStoreHook();

  // 使用现有的useStomp，配置适合字典场景的重连参数
  const { isConnected, connect, subscribe, unsubscribe, disconnect } = useStomp({
    reconnectDelay: 20000, // 字典更新重连时间
    connectionTimeout: 15000, // 连接超时阈值
    useExponentialBackoff: false, // 使用固定间隔重连策略
    maxReconnectAttempts: 3, // 最多重连3次
  });

  // 存储订阅ID
  const subscriptionIds = ref<string[]>([]);

  // 已订阅的主题
  const subscribedTopics = ref<Set<string>>(new Set());

  // 消息回调函数列表
  const messageCallbacks = ref<DictMessageCallback[]>([]);

  // 重试定时器
  let retryTimer: any = null;

  /**
   * 注册字典消息回调
   * @param callback 回调函数
   */
  const onDictMessage = (callback: DictMessageCallback) => {
    messageCallbacks.value.push(callback);
    return () => {
      // 返回取消注册的函数
      const index = messageCallbacks.value.indexOf(callback);
      if (index !== -1) {
        messageCallbacks.value.splice(index, 1);
      }
    };
  };

  /**
   * 初始化WebSocket
   */
  const initWebSocket = async () => {
    try {
      // 检查是否配置了WebSocket端点
      const wsEndpoint = import.meta.env.VITE_APP_WS_ENDPOINT;
      if (!wsEndpoint) {
        console.log("[DictSync] 未配置WebSocket端点,跳过连接");
        return;
      }

      // 连接WebSocket
      connect();

      // 设置字典订阅
      setupDictSubscription();
    } catch (error) {
      console.error("[DictSync] 初始化失败:", error);
    }
  };

  /**
   * 关闭WebSocket
   */
  const closeWebSocket = () => {
    // 清理重试定时器
    if (retryTimer) {
      clearTimeout(retryTimer);
      retryTimer = null;
    }

    // 取消所有订阅
    subscriptionIds.value.forEach((id) => {
      unsubscribe(id);
    });
    subscriptionIds.value = [];
    subscribedTopics.value.clear();

    // 断开连接
    disconnect();
  };

  /**
   * 设置字典订阅
   */
  const setupDictSubscription = () => {
    const topic = "/topic/dict";

    // 防止重复订阅
    if (subscribedTopics.value.has(topic)) {
      console.log(`[DictSync] 跳过重复订阅: ${topic}`);
      return;
    }

    console.log(`[DictSync] 开始尝试订阅字典主题: ${topic}`);

    // 使用简化的重试逻辑，依赖useStomp的连接管理
    const attemptSubscribe = () => {
      if (!isConnected.value) {
        console.log("[DictSync] 等待WebSocket连接建立...");
        // 清理之前的定时器，防止重复
        if (retryTimer) {
          clearTimeout(retryTimer);
        }
        // 10秒后再次尝试
        retryTimer = setTimeout(() => {
          retryTimer = null;
          attemptSubscribe();
        }, 10000);
        return;
      }

      // 清理重试定时器
      if (retryTimer) {
        clearTimeout(retryTimer);
        retryTimer = null;
      }

      // 检查是否已订阅
      if (subscribedTopics.value.has(topic)) {
        return;
      }

      console.log(`[DictSync] 连接已建立，开始订阅: ${topic}`);

      // 订阅字典更新
      const subId = subscribe(topic, (message: IMessage) => {
        handleDictEvent(message);
      });

      if (subId) {
        subscriptionIds.value.push(subId);
        subscribedTopics.value.add(topic);
        console.log(`[DictSync] 字典主题订阅成功: ${topic}`);
      } else {
        console.warn(`[DictSync] 字典主题订阅失败: ${topic}`);
      }
    };

    // 开始尝试订阅
    attemptSubscribe();
  };

  /**
   * 处理字典事件
   * @param message STOMP消息
   */
  const handleDictEvent = (message: IMessage) => {
    if (!message.body) return;

    try {
      // 记录接收到的消息
      console.log(`[DictSync] 收到字典更新消息: ${message.body}`);

      // 尝试解析消息
      const parsedData = JSON.parse(message.body) as DictMessage;
      const dictCode = parsedData.dictCode;

      if (!dictCode) return;

      // 清除缓存，等待按需加载
      dictStore.removeDictItem(dictCode);
      console.log(`[DictSync] 字典缓存已清除: ${dictCode}`);

      // 调用所有注册的回调函数
      messageCallbacks.value.forEach((callback) => {
        try {
          callback(parsedData);
        } catch (callbackError) {
          console.error("[DictSync] 回调执行失败:", callbackError);
        }
      });

      // 显示提示消息
      console.info(`[DictSync] 字典 ${dictCode} 已变更，将在下次使用时自动加载`);
    } catch (error) {
      console.error("[DictSync] 解析消息失败:", error);
    }
  };

  return {
    isConnected,
    initWebSocket,
    closeWebSocket,
    handleDictEvent,
    onDictMessage,
  };
}

/**
 * 字典同步组合式函数
 * 用于监听后端字典变更并同步到前端
 */
export function useDictSync() {
  if (!instance) {
    instance = createDictSyncHook();
  }
  return instance;
}
