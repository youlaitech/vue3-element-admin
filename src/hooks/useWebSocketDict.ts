import { useDictStoreHook } from "@/store/modules/dict.store";
import { useStomp } from "@/hooks/useStomp";
import { IMessage } from "@stomp/stompjs";

// 字典消息类型
export interface DictMessage {
  dictCode: string;
  timestamp: number;
}

// 字典事件回调类型
export type DictMessageCallback = (message: DictMessage) => void;

// 全局单例实例
let instance: ReturnType<typeof createWebSocketDict> | null = null;

// 创建WebSocket词典处理函数
function createWebSocketDict() {
  const dictStore = useDictStoreHook();

  // 使用现有的useStomp
  const { isConnected, connect, subscribe, unsubscribe, disconnect } = useStomp();

  // 存储订阅ID
  const subscriptionIds = ref<string[]>([]);

  // 已订阅的主题
  const subscribedTopics = ref<Set<string>>(new Set());

  // 消息回调函数列表
  const messageCallbacks = ref<DictMessageCallback[]>([]);

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
      // 连接WebSocket
      connect();

      // 设置字典订阅
      setupDictSubscription();
    } catch (error) {
      console.error("[WebSocket] 初始化失败:", error);
    }
  };

  /**
   * 关闭WebSocket
   */
  const closeWebSocket = () => {
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
      console.log(`跳过重复订阅: ${topic}`);
      return;
    }

    console.log(`开始尝试订阅字典主题: ${topic}`);

    // 延迟订阅，确保连接先建立
    const attemptSubscribe = () => {
      if (!isConnected.value) {
        console.log("等待WebSocket连接建立...");
        // 500ms后再次尝试
        setTimeout(attemptSubscribe, 500);
        return;
      }

      // 检查是否已订阅
      if (subscribedTopics.value.has(topic)) {
        return;
      }

      console.log(`连接已建立，开始订阅: ${topic}`);

      // 订阅字典更新
      const subId = subscribe(topic, (message: IMessage) => {
        handleDictEvent(message);
      });

      if (subId) {
        subscriptionIds.value.push(subId);
        subscribedTopics.value.add(topic);
        console.log(`字典主题订阅成功: ${topic}`);
      } else {
        console.warn(`字典主题订阅失败，1秒后重试: ${topic}`);
        // 尝试重新订阅
        setTimeout(attemptSubscribe, 1000);
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
      console.log(`收到字典更新消息: ${message.body}`);

      // 尝试解析消息
      const parsedData = JSON.parse(message.body) as DictMessage;
      const dictCode = parsedData.dictCode;

      if (!dictCode) return;

      // 清除缓存，等待按需加载
      dictStore.removeDictItem(dictCode);
      console.log(`字典缓存已清除: ${dictCode}`);

      // 调用所有注册的回调函数
      messageCallbacks.value.forEach((callback) => {
        try {
          callback(parsedData);
        } catch (callbackError) {
          console.error("[WebSocket] 回调执行失败:", callbackError);
        }
      });

      // 显示提示消息
      console.info(`字典 ${dictCode} 已变更，将在下次使用时自动加载`);
    } catch (error) {
      console.error("[WebSocket] 解析消息失败:", error);
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

// 导出单例实例的钩子
export function useWebSocketDict() {
  if (!instance) {
    instance = createWebSocketDict();
  }
  return instance;
}
