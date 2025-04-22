import { ref } from "vue";
import { useUserStore } from "@/store/modules/user";
import { useDictStoreHook } from "@/store/modules/dict.store";
import SockJS from "sockjs-client";
import Stomp from "webstomp-client";
import { ElMessage } from "element-plus";

export function useWebSocketDict() {
  const userStore = useUserStore();
  const dictStore = useDictStoreHook();

  // WebSocket状态
  const isConnected = ref(false);
  const stompClient = ref(null);
  const subscriptions = ref([]);

  /**
   * 初始化WebSocket
   */
  const initWebSocket = async () => {
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
  const closeWebSocket = () => {
    disconnectWebSocket();
  };

  /**
   * 连接WebSocket服务器
   */
  const connectWebSocket = () => {
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
  const disconnectWebSocket = () => {
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
  const setupDictSubscription = () => {
    // 订阅字典更新
    subscribe("/topic/dict", (message) => {
      handleDictEvent(message);
    });
  };

  /**
   * 处理字典事件
   * @param {Object} event 字典事件
   */
  const handleDictEvent = (event) => {
    // 尝试解析消息，防止服务端发送字符串格式的JSON
    let eventData = event;
    if (typeof event === "string") {
      try {
        eventData = JSON.parse(event);
      } catch (error) {
        console.error("解析WebSocket消息失败:", error);
        return;
      }
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
   */
  const sendMessage = (destination, content) => {
    if (!isConnected.value || !stompClient.value) {
      console.error("WebSocket未连接，无法发送消息");
      return false;
    }

    try {
      // 发送消息
      stompClient.value.send(
        destination,
        JSON.stringify({
          content: content,
          sender: userStore.userInfo.username,
          timestamp: new Date().getTime(),
        }),
        {}
      );
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
   */
  const subscribe = (destination, callback) => {
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
              } catch (e) {
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
