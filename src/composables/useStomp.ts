import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import { Auth } from "@/utils/auth";

export interface UseStompOptions {
  /** WebSocket 地址，不传时使用 VITE_APP_WS_ENDPOINT 环境变量 */
  brokerURL?: string;
  /** 用于鉴权的 token，不传时使用 getAccessToken() 的返回值 */
  token?: string;
  /** 重连延迟，单位毫秒，默认为 8000 */
  reconnectDelay?: number;
  /** 连接超时时间，单位毫秒，默认为 10000 */
  connectionTimeout?: number;
  /** 是否开启指数退避重连策略 */
  useExponentialBackoff?: boolean;
  /** 最大重连次数，默认为 5 */
  maxReconnectAttempts?: number;
  /** 最大重连延迟，单位毫秒，默认为 60000 */
  maxReconnectDelay?: number;
  /** 是否开启调试日志 */
  debug?: boolean;
}

/**
 * STOMP WebSocket连接组合式函数
 * 用于管理WebSocket连接的建立、断开、重连和消息订阅
 */
export function useStomp(options: UseStompOptions = {}) {
  // 默认值：brokerURL 从环境变量中获取，token 从 getAccessToken() 获取
  const defaultBrokerURL = import.meta.env.VITE_APP_WS_ENDPOINT || "";

  const brokerURL = ref(options.brokerURL ?? defaultBrokerURL);
  // 默认配置参数
  const reconnectDelay = options.reconnectDelay ?? 15000; // 默认15秒重连间隔
  const connectionTimeout = options.connectionTimeout ?? 10000;
  const useExponentialBackoff = options.useExponentialBackoff ?? false;
  const maxReconnectAttempts = options.maxReconnectAttempts ?? 3; // 最多重连3次
  const maxReconnectDelay = options.maxReconnectDelay ?? 60000;

  // 连接状态标记
  const isConnected = ref(false);
  // 重连尝试次数
  const reconnectCount = ref(0);
  // 重连计时器
  let reconnectTimer: any = null;
  // 连接超时计时器
  let connectionTimeoutTimer: any = null;
  // 存储所有订阅
  const subscriptions = new Map<string, StompSubscription>();

  // 用于保存 STOMP 客户端的实例
  const client = ref<Client | null>(null);
  // 防止重复连接的标志
  let isConnecting = false;
  let isManualDisconnect = false;

  /**
   * 初始化 STOMP 客户端
   */
  const initializeClient = () => {
    // 如果客户端已存在且正在连接或已连接，直接返回
    if (client.value && (client.value.active || client.value.connected)) {
      console.log("STOMP客户端已存在且处于活动状态，跳过初始化");
      return;
    }

    // 检查WebSocket端点是否配置
    if (!brokerURL.value) {
      console.warn("WebSocket连接失败: 未配置WebSocket端点URL");
      return;
    }

    // 每次连接前重新获取最新令牌，不依赖之前的token值
    const currentToken = Auth.getAccessToken();

    // 检查令牌是否为空，如果为空则不进行连接
    if (!currentToken) {
      console.warn("WebSocket连接失败：授权令牌为空，请先登录");
      return;
    }

    // 如果有旧的客户端，先清理
    if (client.value) {
      try {
        client.value.deactivate();
      } catch (error) {
        console.warn("清理旧客户端时出错:", error);
      }
      client.value = null;
    }

    // 创建 STOMP 客户端
    client.value = new Client({
      brokerURL: brokerURL.value,
      connectHeaders: {
        Authorization: `Bearer ${currentToken}`,
      },
      debug: options.debug ? console.log : () => {},
      reconnectDelay: 0, // 禁用内置重连机制，使用自定义重连
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    // 设置连接监听器
    client.value.onConnect = () => {
      isConnected.value = true;
      isConnecting = false;
      reconnectCount.value = 0;
      clearTimeout(connectionTimeoutTimer);
      clearTimeout(reconnectTimer);
      console.log("WebSocket连接已建立");
    };

    // 设置断开连接监听器
    client.value.onDisconnect = () => {
      isConnected.value = false;
      isConnecting = false;
      console.log("WebSocket连接已断开");

      // 如果不是手动断开且未达到最大重连次数，则尝试重连
      if (!isManualDisconnect && reconnectCount.value < maxReconnectAttempts) {
        handleReconnect();
      }
    };

    // 设置 Web Socket 关闭监听器
    client.value.onWebSocketClose = (event) => {
      isConnected.value = false;
      isConnecting = false;
      console.log(`WebSocket已关闭: ${event?.code} ${event?.reason}`);

      // 如果是手动断开，不要重连
      if (isManualDisconnect) {
        console.log("手动断开连接，不进行重连");
        return;
      }

      // 如果是授权问题导致的关闭，尝试重连
      if (
        (event?.code === 1000 || event?.code === 1006 || event?.code === 1008) &&
        reconnectCount.value < maxReconnectAttempts
      ) {
        console.log("检测到连接异常关闭，将尝试重连");

        // 通过 handleReconnect 统一处理重连，避免重复计数
        handleReconnect();
      }
    };

    // 设置错误监听器
    client.value.onStompError = (frame) => {
      console.error("STOMP错误:", frame.headers, frame.body);
      isConnecting = false;

      // 检查是否是授权错误
      if (
        frame.headers?.message?.includes("Unauthorized") ||
        frame.body?.includes("Unauthorized") ||
        frame.body?.includes("Token")
      ) {
        console.warn("WebSocket授权错误，请检查登录状态");
        // 授权错误不进行重连
        isManualDisconnect = true;
      }
    };
  };

  /**
   * 处理重连逻辑
   */
  const handleReconnect = () => {
    // 如果已经在连接中或手动断开，不重连
    if (isConnecting || isManualDisconnect) {
      return;
    }

    if (reconnectCount.value >= maxReconnectAttempts) {
      console.error(`已达到最大重连次数(${maxReconnectAttempts})，停止重连`);
      return;
    }

    reconnectCount.value++;
    console.log(`准备重连(${reconnectCount.value}/${maxReconnectAttempts})...`);

    // 使用指数退避策略增加重连间隔
    const delay = useExponentialBackoff
      ? Math.min(reconnectDelay * Math.pow(2, reconnectCount.value - 1), maxReconnectDelay)
      : reconnectDelay;

    // 清除之前的计时器
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
    }

    // 设置重连计时器
    reconnectTimer = setTimeout(() => {
      if (!isConnected.value && !isManualDisconnect && !isConnecting) {
        console.log(`开始重连...`);
        connect();
      }
    }, delay);
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

  // 初始化客户端
  initializeClient();

  /**
   * 激活连接（如果已经连接或正在激活则直接返回）
   */
  const connect = () => {
    // 重置手动断开标志
    isManualDisconnect = false;

    // 检查是否有配置WebSocket端点
    if (!brokerURL.value) {
      console.error("WebSocket连接失败: 未配置WebSocket端点URL");
      return;
    }

    // 防止重复连接
    if (isConnecting) {
      console.log("WebSocket正在连接中，跳过重复连接请求");
      return;
    }

    if (!client.value) {
      initializeClient();
    }

    if (!client.value) {
      console.error("STOMP客户端初始化失败");
      return;
    }

    // 避免重复连接:检查是否已连接
    if (client.value.connected) {
      console.log("WebSocket已经连接,跳过重复连接");
      isConnected.value = true;
      return;
    }

    // 设置连接标志
    isConnecting = true;

    // 设置连接超时
    clearTimeout(connectionTimeoutTimer);
    connectionTimeoutTimer = setTimeout(() => {
      if (!isConnected.value && isConnecting) {
        console.warn("WebSocket连接超时");
        isConnecting = false;
        if (!isManualDisconnect && reconnectCount.value < maxReconnectAttempts) {
          handleReconnect();
        }
      }
    }, connectionTimeout);

    try {
      client.value.activate();
      console.log("正在建立WebSocket连接...");
    } catch (error) {
      console.error("激活WebSocket连接失败:", error);
      isConnecting = false;
    }
  };

  /**
   * 订阅指定主题
   * @param destination 目标主题地址
   * @param callback 接收到消息时的回调函数
   * @returns 返回订阅 id，用于后续取消订阅
   */
  const subscribe = (destination: string, callback: (_message: IMessage) => void): string => {
    if (!client.value || !client.value.connected) {
      console.warn(`尝试订阅 ${destination} 失败: 客户端未连接`);
      return "";
    }

    try {
      const subscription = client.value.subscribe(destination, callback);
      const subscriptionId = subscription.id;
      subscriptions.set(subscriptionId, subscription);
      console.log(`订阅成功: ${destination}, ID: ${subscriptionId}`);
      return subscriptionId;
    } catch (error) {
      console.error(`订阅 ${destination} 失败:`, error);
      return "";
    }
  };

  /**
   * 取消订阅
   * @param subscriptionId 订阅 id
   */
  const unsubscribe = (subscriptionId: string) => {
    const subscription = subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.unsubscribe();
      subscriptions.delete(subscriptionId);
      console.log(`已取消订阅: ${subscriptionId}`);
    }
  };

  /**
   * 断开WebSocket连接
   */
  const disconnect = () => {
    // 设置手动断开标志
    isManualDisconnect = true;

    // 清除所有计时器
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    if (connectionTimeoutTimer) {
      clearTimeout(connectionTimeoutTimer);
      connectionTimeoutTimer = null;
    }

    // 清除所有订阅
    for (const [id, subscription] of subscriptions.entries()) {
      try {
        subscription.unsubscribe();
      } catch (error) {
        console.warn(`取消订阅 ${id} 时出错:`, error);
      }
    }
    subscriptions.clear();

    // 断开连接
    if (client.value) {
      try {
        if (client.value.connected || client.value.active) {
          client.value.deactivate();
          console.log("WebSocket连接已主动断开");
        }
      } catch (error) {
        console.error("断开WebSocket连接时出错:", error);
      }
      client.value = null;
    }

    isConnected.value = false;
    isConnecting = false;
    reconnectCount.value = 0;
  };

  return {
    isConnected,
    connect,
    subscribe,
    unsubscribe,
    disconnect,
  };
}
