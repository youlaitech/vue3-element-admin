import { ref } from "vue";
import { useUserStore } from "@/store/modules/user";
import { useDictStoreHook } from "@/store/modules/dict.store";
import SockJS from "sockjs-client";
import Stomp, { Client, Subscription } from "webstomp-client";
import { ElMessage } from "element-plus";

// 字典WebSocket事件类型定义
interface DictWebSocketEvent {
  type: "DICT_UPDATED" | "DICT_DELETED";
  dictCode: string;
  timestamp: number;
}

// 消息类型定义
interface WebSocketMessage {
  content: string;
  sender: string;
  timestamp: number;
}

export function useWebSocketDict() {
  const userStore = useUserStore();
  const dictStore = useDictStoreHook();

  // WebSocket状态
  const isConnected = ref<boolean>(false);
  const stompClient = ref<Client | null>(null);
  const subscriptions = ref<Subscription[]>([]);

  /**
   * 初始化WebSocket
   */
  const initWebSocket = async (): Promise<void> => {
    try {
      await connectWebSocket();
      setupDictSubscription();
    } catch (error) {
      console.error("初始化WebSocket失败:", error);
    }
  };

  /**
   * 关闭WebSocket
   */
  const closeWebSocket = (): void => {
    disconnectWebSocket();
  };

  /**
   * 连接WebSocket服务器
   */
  const connectWebSocket = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        const serverUrl = import.meta.env.VITE_APP_BASE_API + "/ws";

        // 创建SockJS连接
        const socket = new SockJS(serverUrl);

        // 创建STOMP客户端
        const client = Stomp.over(socket);

        // 禁用调试日志
        client.debug = () => {};

        // 添加认证头信息
        const headers = {
          Authorization: userStore.token,
        };

        // 连接到WebSocket服务器
        client.connect(
          headers,
          () => {
            stompClient.value = client;
            isConnected.value = true;
            console.log("WebSocket连接成功");
            resolve();
          },
          (error) => {
            console.error("WebSocket连接失败:", error);
            isConnected.value = false;
            reject(error);
          }
        );
      } catch (error) {
        console.error("创建WebSocket连接时出错:", error);
        reject(error);
      }
    });
  };

  /**
   * 断开WebSocket连接
   */
  const disconnectWebSocket = (): void => {
    // 取消所有订阅
    subscriptions.value.forEach((subscription) => {
      if (subscription && typeof subscription.unsubscribe === "function") {
        subscription.unsubscribe();
      }
    });
    subscriptions.value = [];

    // 断开连接
    if (stompClient.value && stompClient.value.connected) {
      stompClient.value.disconnect();
      stompClient.value = null;
    }

    isConnected.value = false;
    console.log("WebSocket连接已断开");
  };

  /**
   * 设置字典订阅
   */
  const setupDictSubscription = (): void => {
    // 订阅字典更新
    subscribe("/topic/dict", (message: any) => {
      handleDictEvent(message);
    });
  };

  /**
   * 处理字典事件
   * @param {Object | string} event 字典事件
   */
  const handleDictEvent = (event: any): void => {
    // 尝试解析消息，防止服务端发送字符串格式的JSON
    let eventData: DictWebSocketEvent;
    if (typeof event === "string") {
      try {
        eventData = JSON.parse(event) as DictWebSocketEvent;
      } catch (error) {
        console.error("解析WebSocket消息失败:", error);
        return;
      }
    } else {
      eventData = event as DictWebSocketEvent;
    }

    const { type, dictCode } = eventData;

    if (type === "DICT_UPDATED") {
      // 删除缓存，强制重新加载
      dictStore.removeDictItem(dictCode);
      console.log(`字典 ${dictCode} 已更新，缓存已清除`);
      ElMessage.success(`字典 ${dictCode} 已更新`);
    } else if (type === "DICT_DELETED") {
      // 删除缓存
      dictStore.removeDictItem(dictCode);
      console.log(`字典 ${dictCode} 已删除，缓存已清除`);
      ElMessage.warning(`字典 ${dictCode} 已删除`);
    }
  };

  /**
   * 发送消息到WebSocket服务器
   * @param {string} destination 目标地址
   * @param {string} content 消息内容
   * @returns {boolean} 是否发送成功
   */
  const sendMessage = (destination: string, content: string): boolean => {
    if (!isConnected.value || !stompClient.value) {
      console.error("WebSocket未连接，无法发送消息");
      return false;
    }

    try {
      // 发送消息
      const message: WebSocketMessage = {
        content: content,
        sender: userStore.userInfo.username,
        timestamp: new Date().getTime(),
      };

      stompClient.value.send(destination, JSON.stringify(message), {});
      return true;
    } catch (error) {
      console.error("发送消息失败:", error);
      return false;
    }
  };

  /**
   * 订阅WebSocket主题
   * @param {string} destination 订阅地址
   * @param {Function} callback 回调函数
   * @returns {Subscription | null} 订阅对象
   */
  const subscribe = (destination: string, callback: (data: any) => void): Subscription | null => {
    if (!isConnected.value || !stompClient.value) {
      console.error("WebSocket未连接，无法订阅");
      return null;
    }

    try {
      // 订阅主题
      const subscription = stompClient.value.subscribe(destination, (message) => {
        if (message.body) {
          try {
            // 尝试解析JSON格式消息
            const data = JSON.parse(message.body);

            // 如果返回的是JSON字符串，再次解析
            if (typeof data === "string" && data.startsWith("{") && data.endsWith("}")) {
              try {
                const parsedData = JSON.parse(data);
                callback(parsedData);
              } catch {
                // 如果再次解析失败，传递原始数据
                callback(data);
              }
            } else {
              // 直接传递已解析的数据
              callback(data);
            }
          } catch (e) {
            // 如果解析失败，传递原始消息
            console.warn("解析WebSocket消息失败，传递原始消息:", e);
            callback(message.body);
          }
        }
      });

      // 保存订阅引用，以便后续取消订阅
      subscriptions.value.push(subscription);

      return subscription;
    } catch (error) {
      console.error("订阅失败:", error);
      return null;
    }
  };

  return {
    isConnected,
    connectWebSocket,
    disconnectWebSocket,
    sendMessage,
    subscribe,
    initWebSocket,
    closeWebSocket,
    handleDictEvent,
  };
}
