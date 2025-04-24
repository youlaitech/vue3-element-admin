import { ref } from "vue";
import { useDictStoreHook } from "@/store/modules/dict.store";
import { useStomp } from "@/hooks/useStomp";
import { ElMessage } from "element-plus";
import { IMessage } from "@stomp/stompjs";

// 字典事件类型
interface DictEvent {
  type: string;
  dictCode: string;
  timestamp?: number;
}

export function useWebSocketDict() {
  const dictStore = useDictStoreHook();

  // 使用现有的useStomp
  const { isConnected, connect, subscribe, unsubscribe, disconnect } = useStomp();

  // 存储订阅ID
  const subscriptionIds = ref<string[]>([]);

  /**
   * 初始化WebSocket
   */
  const initWebSocket = async () => {
    try {
      // 连接WebSocket
      connect();

      // 设置字典订阅
      setupDictSubscription();

      console.log("字典WebSocket初始化完成");
    } catch (error) {
      console.error("初始化字典WebSocket失败:", error);
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

    // 断开连接
    disconnect();

    console.log("字典WebSocket已关闭");
  };

  /**
   * 设置字典订阅
   */
  const setupDictSubscription = () => {
    // 订阅字典更新
    const subId = subscribe("/topic/dict", (message: IMessage) => {
      handleDictEvent(message);
    });

    if (subId) {
      subscriptionIds.value.push(subId);
    }
  };

  /**
   * 处理字典事件
   * @param message STOMP消息
   */
  const handleDictEvent = (message: IMessage) => {
    if (!message.body) return;

    try {
      // 尝试解析消息
      const eventData = JSON.parse(message.body) as DictEvent;
      console.log(
        `[WebSocket] 接收到字典事件: ${eventData.type}, 字典编码: ${eventData.dictCode}`,
        eventData
      );

      if (eventData.type === "DICT_UPDATED") {
        // 删除缓存，强制重新加载
        dictStore.removeDictItem(eventData.dictCode);
        console.log(`[WebSocket] 字典 ${eventData.dictCode} 已更新，缓存已清除`);
        ElMessage.success(`字典 ${eventData.dictCode} 已更新`);

        // 派发自定义事件，通知组件刷新数据
        window.dispatchEvent(
          new CustomEvent("dict-updated", {
            detail: {
              dictCode: eventData.dictCode,
              timestamp: eventData.timestamp,
            },
          })
        );
      } else if (eventData.type === "DICT_DELETED") {
        // 删除缓存
        dictStore.removeDictItem(eventData.dictCode);
        console.log(`[WebSocket] 字典 ${eventData.dictCode} 已删除，缓存已清除`);
        ElMessage.warning(`字典 ${eventData.dictCode} 已删除`);

        // 派发自定义事件，通知组件刷新数据
        window.dispatchEvent(
          new CustomEvent("dict-deleted", {
            detail: {
              dictCode: eventData.dictCode,
              timestamp: eventData.timestamp,
            },
          })
        );
      }
    } catch (error) {
      console.error("[WebSocket] 解析字典WebSocket消息失败:", error, message.body);
    }
  };

  return {
    isConnected,
    initWebSocket,
    closeWebSocket,
    handleDictEvent,
  };
}
