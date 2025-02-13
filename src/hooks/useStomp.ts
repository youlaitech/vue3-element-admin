import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import { getAccessToken } from "@/utils/auth";

export interface UseStompOptions {
  /** WebSocket 地址，不传时使用 VITE_APP_WS_ENDPOINT 环境变量 */
  brokerURL?: string;
  /** 用于鉴权的 token，不传时使用 getAccessToken() 的返回值 */
  token?: string;
  /** 重连延迟，单位毫秒，默认为 5000 */
  reconnectDelay?: number;
  /** 是否开启调试日志 */
  debug?: boolean;
}

export function useStomp(options: UseStompOptions = {}) {
  // 默认值：brokerURL 从环境变量中获取，token 从 getAccessToken() 获取
  const defaultBrokerURL = import.meta.env.VITE_APP_WS_ENDPOINT || "";
  const defaultToken = getAccessToken();

  const brokerURL = ref(options.brokerURL ?? defaultBrokerURL);
  const token = options.token ?? defaultToken;

  // 连接状态标记
  const isConnected = ref(false);
  // 存储所有订阅
  const subscriptions = new Map<string, StompSubscription>();

  // 用于保存 STOMP 客户端的实例
  let client = ref<Client | null>(null);

  /**
   * 初始化 STOMP 客户端
   * 只有在 brokerURL 非空时才会初始化客户端
   */
  const initializeClient = () => {
    if (!brokerURL.value) {
      console.warn(
        "brokerURL is required. Please set the WebSocket URL in your .env file (VITE_APP_WS_ENDPOINT)."
      );
      return;
    }

    if (!client.value) {
      client.value = new Client({
        brokerURL: brokerURL.value,
        reconnectDelay: options.reconnectDelay ?? 5000,
        debug: options.debug ? (msg) => console.log("[STOMP]", msg) : () => {},
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      client.value.onConnect = (frame) => {
        isConnected.value = true;
        console.log("STOMP connected", frame);
      };

      client.value.onStompError = (frame) => {
        console.error("Broker reported error: " + frame.headers["message"]);
        console.error("Additional details: " + frame.body);
      };

      client.value.onWebSocketClose = (evt) => {
        isConnected.value = false;
        console.warn("WebSocket closed", evt);
      };
    }
  };

  // 监听 brokerURL 的变化，若地址改变则重新初始化
  watch(brokerURL, (newURL, oldURL) => {
    if (newURL !== oldURL) {
      console.log(`brokerURL changed from ${oldURL} to ${newURL}`);
      // 断开当前连接，重新激活客户端
      if (client.value && client.value.connected) {
        client.value.deactivate();
      }
      brokerURL.value = newURL;
      initializeClient(); // 重新初始化客户端
    }
  });

  // 在组件挂载时检查并初始化客户端
  onMounted(() => {
    console.log("useStomp onMounted initializeClient");
    initializeClient();
  });

  /**
   * 激活连接（如果已经连接或正在激活则直接返回）
   */
  const connect = () => {
    if (client.value && (client.value.connected || client.value.active)) {
      console.log("Already connected or connecting, skipping connect() call.");
      return;
    }
    client.value?.activate();
  };

  /**
   * 订阅指定主题
   * @param destination 目标主题地址
   * @param callback 接收到消息时的回调函数
   * @returns 返回订阅 id，用于后续取消订阅
   */
  const subscribe = (destination: string, callback: (message: IMessage) => void): string => {
    if (client.value) {
      const subscription = client.value.subscribe(destination, callback);
      subscriptions.set(subscription.id, subscription);
      return subscription.id;
    }
    return "";
  };

  /**
   * 取消指定订阅
   * @param subscriptionId 要取消的订阅 id
   */
  const unsubscribe = (subscriptionId: string) => {
    const subscription = subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.unsubscribe();
      subscriptions.delete(subscriptionId);
    }
  };

  /**
   * 主动断开连接（如果未连接则不执行）
   */
  const disconnect = () => {
    if (client.value && !(client.value.connected || client.value.active)) {
      console.log("Already disconnected, skipping disconnect() call.");
      return;
    }
    client.value?.deactivate();
    isConnected.value = false;
  };

  return {
    client,
    isConnected,
    connect,
    subscribe,
    unsubscribe,
    disconnect,
    brokerURL,
  };
}
