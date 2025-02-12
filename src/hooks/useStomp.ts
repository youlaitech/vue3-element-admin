import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import { getAccessToken } from "@/utils/auth";

export interface UseStompOptions {
  /** WebSocket 地址，不传时使用 VITE_APP_WS_ENDPOINT 环境变量 */
  brokerURL?: string;
  /** 用于鉴权的 token，不传时使用 getToken() 的返回值 */
  token?: string;
  /** 重连延迟，单位毫秒，默认为 5000 */
  reconnectDelay?: number;
  /** 是否开启调试日志 */
  debug?: boolean;
}

export function useStomp(options: UseStompOptions = {}) {
  const defaultBrokerURL = import.meta.env.VITE_APP_WS_ENDPOINT || "";
  const defaultToken = getAccessToken();

  const brokerURL = ref(options.brokerURL ?? defaultBrokerURL);
  const token = options.token ?? defaultToken;

  const isConnected = ref(false);
  const subscriptions = new Map<string, StompSubscription>();

  const client = ref<Client | null>(null);

  // 初始化 STOMP 客户端
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
      if (client.value && client.value.connected) {
        client.value.deactivate();
      }
      brokerURL.value = newURL;
      initializeClient(); // 重新初始化客户端
    }
  });

  // 在组件挂载时检查并初始化客户端
  onMounted(() => {
    initializeClient();
  });

  // 激活连接（如果已经连接或正在激活则直接返回）
  const connect = () => {
    if (client.value && (client.value.connected || client.value.active)) {
      console.log("Already connected or connecting, skipping connect() call.");
      return;
    }
    if (client.value) {
      client.value.activate();
    } else {
      console.warn("Client is not initialized.");
    }
  };

  // 订阅指定主题，连接成功后自动订阅
  const subscribe = (destination: string, callback: (message: IMessage) => void): string => {
    if (!client.value) {
      console.error("STOMP client is not initialized.");
      return "";
    }

    // 如果还没有连接，就先激活连接
    if (!isConnected.value) {
      console.log("Not connected yet. Connecting...");
      connect();
    }

    // 连接成功后订阅主题
    const subscription = client.value.subscribe(destination, callback);
    subscriptions.set(subscription.id, subscription);
    return subscription.id;
  };

  // 取消指定订阅
  const unsubscribe = (subscriptionId: string) => {
    const subscription = subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.unsubscribe();
      subscriptions.delete(subscriptionId);
    }
  };

  // 主动断开连接（如果未连接则不执行）
  const disconnect = () => {
    if (client.value && !(client.value.connected || client.value.active)) {
      console.log("Already disconnected, skipping disconnect() call.");
      return;
    }
    if (client.value) {
      client.value.deactivate();
    } else {
      console.warn("Client is not initialized.");
    }
    isConnected.value = false;
  };

  return {
    client,
    isConnected,
    connect,
    subscribe, // 订阅函数放到这里
    unsubscribe,
    disconnect,
    brokerURL, // 暴露 brokerURL 以便组件中动态修改
  };
}
