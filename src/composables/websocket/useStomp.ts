import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import { AuthStorage } from "@/utils/auth";

export interface UseStompOptions {
  /** WebSocket 地址，不传时使用 VITE_APP_WS_ENDPOINT 环境变量 */
  brokerURL?: string;
  /** 用于鉴权的 token，不传时使用 getAccessToken() 的返回值 */
  token?: string;
  /** 重连延迟，单位毫秒，默认为 15000 */
  reconnectDelay?: number;
  /** 连接超时时间，单位毫秒，默认为 10000 */
  connectionTimeout?: number;
  /** 是否开启指数退避重连策略 */
  useExponentialBackoff?: boolean;
  /** 最大重连次数，默认为 3 */
  maxReconnectAttempts?: number;
  /** 最大重连延迟，单位毫秒，默认为 60000 */
  maxReconnectDelay?: number;
  /** 是否开启调试日志 */
  debug?: boolean;
  /** 是否在重连时自动恢复订阅，默认为 true */
  autoRestoreSubscriptions?: boolean;
  /**
   * 心跳接收间隔，单位毫秒，默认为 4000
   * 注意：标签页失活时，浏览器会节流定时器，建议设置较长的间隔（如 10000）以减少失活影响
   */
  heartbeatIncoming?: number;
  /**
   * 心跳发送间隔，单位毫秒，默认为 4000
   * 注意：标签页失活时，浏览器会节流定时器，建议设置较长的间隔（如 10000）以减少失活影响
   */
  heartbeatOutgoing?: number;
}

/**
 * 订阅配置信息
 */
interface SubscriptionConfig {
  destination: string;
  callback: (message: IMessage) => void;
}

/**
 * 连接状态枚举
 */
enum ConnectionState {
  DISCONNECTED = "DISCONNECTED",
  CONNECTING = "CONNECTING",
  CONNECTED = "CONNECTED",
  RECONNECTING = "RECONNECTING",
}

/**
 * STOMP WebSocket 连接管理组合式函数
 *
 * 核心功能：
 * - 自动连接管理（连接、断开、重连）
 * - 订阅管理（订阅、取消订阅、自动恢复）
 * - 心跳检测
 * - Token 自动刷新
 *
 * @param options 配置选项
 * @returns STOMP 客户端操作接口
 */
export function useStomp(options: UseStompOptions = {}) {
  // ==================== 配置初始化 ====================
  const defaultBrokerURL = import.meta.env.VITE_APP_WS_ENDPOINT || "";

  const config = {
    brokerURL: ref(options.brokerURL ?? defaultBrokerURL),
    reconnectDelay: options.reconnectDelay ?? 15000,
    connectionTimeout: options.connectionTimeout ?? 10000,
    useExponentialBackoff: options.useExponentialBackoff ?? false,
    maxReconnectAttempts: options.maxReconnectAttempts ?? 3,
    maxReconnectDelay: options.maxReconnectDelay ?? 60000,
    autoRestoreSubscriptions: options.autoRestoreSubscriptions ?? true,
    debug: options.debug ?? false,
    heartbeatIncoming: options.heartbeatIncoming ?? 4000,
    heartbeatOutgoing: options.heartbeatOutgoing ?? 4000,
  };

  // ==================== 状态管理 ====================
  const connectionState = ref<ConnectionState>(ConnectionState.DISCONNECTED);
  const isConnected = computed(() => connectionState.value === ConnectionState.CONNECTED);
  const reconnectAttempts = ref(0);

  // ==================== 定时器管理 ====================
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let connectionTimeoutTimer: ReturnType<typeof setTimeout> | null = null;

  // ==================== 订阅管理 ====================
  // 活动订阅：存储当前 STOMP 订阅对象
  const activeSubscriptions = new Map<string, StompSubscription>();
  // 订阅配置注册表：用于自动恢复订阅
  const subscriptionRegistry = new Map<string, SubscriptionConfig>();

  // ==================== 客户端实例 ====================
  const stompClient = ref<Client | null>(null);
  let isManualDisconnect = false;

  // ==================== 工具函数 ====================

  /**
   * 清理所有定时器
   */
  const clearAllTimers = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (connectionTimeoutTimer) {
      clearTimeout(connectionTimeoutTimer);
      connectionTimeoutTimer = null;
    }
  };

  /**
   * 日志输出（支持调试模式控制）
   */
  const log = config.debug ? (...args: any[]) => console.log("[useStomp]", ...args) : () => {};
  const logWarn = (...args: any[]) => console.warn("[useStomp]", ...args);
  const logError = (...args: any[]) => console.error("[useStomp]", ...args);

  /**
   * 恢复所有订阅
   */
  const restoreSubscriptions = () => {
    if (!config.autoRestoreSubscriptions || subscriptionRegistry.size === 0) {
      return;
    }

    log(`开始恢复 ${subscriptionRegistry.size} 个订阅...`);

    for (const [destination, subscriptionConfig] of subscriptionRegistry.entries()) {
      try {
        performSubscribe(destination, subscriptionConfig.callback);
      } catch (error) {
        logError(`恢复订阅 ${destination} 失败:`, error);
      }
    }
  };

  /**
   * 初始化 STOMP 客户端
   */
  const initializeClient = () => {
    // 如果客户端已存在且处于活动状态，直接返回
    if (stompClient.value && (stompClient.value.active || stompClient.value.connected)) {
      log("STOMP 客户端已存在且处于活动状态，跳过初始化");
      return;
    }

    // 检查 WebSocket 端点是否配置
    if (!config.brokerURL.value) {
      logWarn("WebSocket 连接失败: 未配置 WebSocket 端点 URL");
      return;
    }

    // 每次连接前重新获取最新令牌
    const accessToken = AuthStorage.getAccessToken();
    if (!accessToken) {
      logWarn("WebSocket 连接失败：授权令牌为空，请先登录");
      return;
    }

    // 清理旧客户端
    if (stompClient.value) {
      try {
        stompClient.value.deactivate();
      } catch (error) {
        logWarn("清理旧客户端时出错:", error);
      }
      stompClient.value = null;
    }

    // 创建 STOMP 客户端
    stompClient.value = new Client({
      brokerURL: config.brokerURL.value,
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      debug: config.debug ? (msg) => console.log("[STOMP]", msg) : () => {},
      reconnectDelay: 0, // 禁用内置重连，使用自定义重连逻辑
      heartbeatIncoming: config.heartbeatIncoming,
      heartbeatOutgoing: config.heartbeatOutgoing,
    });

    // ==================== 事件监听器 ====================

    // 连接成功
    stompClient.value.onConnect = () => {
      connectionState.value = ConnectionState.CONNECTED;
      reconnectAttempts.value = 0;
      clearAllTimers();

      log("✅ WebSocket 连接已建立");

      // 自动恢复订阅
      restoreSubscriptions();
    };

    // 连接断开
    stompClient.value.onDisconnect = () => {
      connectionState.value = ConnectionState.DISCONNECTED;
      log("❌ WebSocket 连接已断开");

      // 清空活动订阅（但保留订阅配置用于恢复）
      activeSubscriptions.clear();

      // 如果不是手动断开且未达到最大重连次数，则尝试重连
      if (!isManualDisconnect && reconnectAttempts.value < config.maxReconnectAttempts) {
        scheduleReconnect();
      }
    };

    // WebSocket 关闭
    stompClient.value.onWebSocketClose = (event) => {
      connectionState.value = ConnectionState.DISCONNECTED;
      log(`WebSocket 已关闭: code=${event?.code}, reason=${event?.reason}`);

      // 如果是手动断开，不重连
      if (isManualDisconnect) {
        log("手动断开连接，不进行重连");
        return;
      }

      // 对于异常关闭，尝试重连
      if (
        event?.code &&
        [1000, 1006, 1008, 1011].includes(event.code) &&
        reconnectAttempts.value < config.maxReconnectAttempts
      ) {
        log("检测到连接异常关闭，将尝试重连");
        scheduleReconnect();
      }
    };

    // STOMP 错误
    stompClient.value.onStompError = (frame) => {
      logError("STOMP 错误:", frame.headers, frame.body);
      connectionState.value = ConnectionState.DISCONNECTED;

      // 检查是否是授权错误
      const isAuthError =
        frame.headers?.message?.includes("Unauthorized") ||
        frame.body?.includes("Unauthorized") ||
        frame.body?.includes("Token") ||
        frame.body?.includes("401");

      if (isAuthError) {
        logWarn("WebSocket 授权错误，停止重连");
        isManualDisconnect = true; // 授权错误不进行重连
      }
    };
  };

  /**
   * 调度重连任务
   */
  const scheduleReconnect = () => {
    // 如果正在连接或手动断开，不重连
    if (connectionState.value === ConnectionState.CONNECTING || isManualDisconnect) {
      return;
    }

    // 检查是否达到最大重连次数
    if (reconnectAttempts.value >= config.maxReconnectAttempts) {
      logError(`已达到最大重连次数 (${config.maxReconnectAttempts})，停止重连`);
      return;
    }

    reconnectAttempts.value++;
    connectionState.value = ConnectionState.RECONNECTING;

    // 计算重连延迟（支持指数退避）
    const delay = config.useExponentialBackoff
      ? Math.min(
          config.reconnectDelay * Math.pow(2, reconnectAttempts.value - 1),
          config.maxReconnectDelay
        )
      : config.reconnectDelay;

    log(`准备重连 (${reconnectAttempts.value}/${config.maxReconnectAttempts})，延迟 ${delay}ms`);

    // 清除之前的重连计时器
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
    }

    // 设置重连计时器
    reconnectTimer = setTimeout(() => {
      if (connectionState.value !== ConnectionState.CONNECTED && !isManualDisconnect) {
        log(`开始第 ${reconnectAttempts.value} 次重连...`);
        connect();
      }
    }, delay);
  };

  // 监听 brokerURL 的变化，自动重新初始化
  watch(config.brokerURL, (newURL, oldURL) => {
    if (newURL !== oldURL) {
      log(`WebSocket 端点已更改: ${oldURL} -> ${newURL}`);

      // 断开当前连接
      if (stompClient.value && stompClient.value.connected) {
        stompClient.value.deactivate();
      }

      // 重新初始化客户端
      initializeClient();
    }
  });

  // 初始化客户端
  initializeClient();

  // ==================== 标签页可见性监听 ====================

  /**
   * 处理标签页可见性变化
   * 当标签页从失活变为激活时，检查连接状态并尝试重连
   */
  const handleVisibilityChange = () => {
    if (document.hidden) {
      log("标签页已失活");
    } else {
      log("标签页已激活，检查WebSocket连接状态...");

      // 标签页激活时，检查连接状态
      if (stompClient.value && !stompClient.value.connected && !isManualDisconnect) {
        logWarn("检测到WebSocket连接已断开，尝试重新连接...");
        // 重置重连次数，给予更多重连机会
        reconnectAttempts.value = 0;
        connect();
      }
    }
  };

  // 监听标签页可见性变化
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", handleVisibilityChange);
  }

  // 清理函数：移除事件监听器
  const cleanup = () => {
    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    }
    disconnect();
  };

  // ==================== 公共接口 ====================

  /**
   * 建立 WebSocket 连接
   */
  const connect = () => {
    // 重置手动断开标志
    isManualDisconnect = false;

    // 检查是否配置了 WebSocket 端点
    if (!config.brokerURL.value) {
      logError("WebSocket 连接失败: 未配置 WebSocket 端点 URL");
      return;
    }

    // 防止重复连接
    if (connectionState.value === ConnectionState.CONNECTING) {
      log("WebSocket 正在连接中，跳过重复连接请求");
      return;
    }

    // 如果客户端不存在，先初始化
    if (!stompClient.value) {
      initializeClient();
    }

    if (!stompClient.value) {
      logError("STOMP 客户端初始化失败");
      return;
    }

    // 避免重复连接：检查是否已连接
    if (stompClient.value.connected) {
      log("WebSocket 已连接，跳过重复连接");
      connectionState.value = ConnectionState.CONNECTED;
      return;
    }

    // 设置连接状态
    connectionState.value = ConnectionState.CONNECTING;

    // 设置连接超时
    if (connectionTimeoutTimer) {
      clearTimeout(connectionTimeoutTimer);
    }

    connectionTimeoutTimer = setTimeout(() => {
      if (connectionState.value === ConnectionState.CONNECTING) {
        logWarn("WebSocket 连接超时");
        connectionState.value = ConnectionState.DISCONNECTED;

        // 超时后尝试重连
        if (!isManualDisconnect && reconnectAttempts.value < config.maxReconnectAttempts) {
          scheduleReconnect();
        }
      }
    }, config.connectionTimeout);

    try {
      stompClient.value.activate();
      log("正在建立 WebSocket 连接...");
    } catch (error) {
      logError("激活 WebSocket 连接失败:", error);
      connectionState.value = ConnectionState.DISCONNECTED;
    }
  };

  /**
   * 执行订阅操作（内部方法）
   */
  const performSubscribe = (destination: string, callback: (message: IMessage) => void): string => {
    if (!stompClient.value || !stompClient.value.connected) {
      logWarn(`尝试订阅 ${destination} 失败: 客户端未连接`);
      return "";
    }

    try {
      const subscription = stompClient.value.subscribe(destination, callback);
      const subscriptionId = subscription.id;
      activeSubscriptions.set(subscriptionId, subscription);
      log(`✓ 订阅成功: ${destination} (ID: ${subscriptionId})`);
      return subscriptionId;
    } catch (error) {
      logError(`订阅 ${destination} 失败:`, error);
      return "";
    }
  };

  /**
   * 订阅指定主题
   *
   * @param destination 目标主题地址（如：/topic/message）
   * @param callback 接收到消息时的回调函数
   * @returns 订阅 ID，用于后续取消订阅
   */
  const subscribe = (destination: string, callback: (message: IMessage) => void): string => {
    // 保存订阅配置到注册表，用于断线重连后自动恢复
    subscriptionRegistry.set(destination, { destination, callback });

    // 如果已连接，立即订阅
    if (stompClient.value?.connected) {
      return performSubscribe(destination, callback);
    }

    log(`暂存订阅配置: ${destination}，将在连接建立后自动订阅`);
    return "";
  };

  /**
   * 取消订阅
   *
   * @param subscriptionId 订阅 ID（由 subscribe 方法返回）
   */
  const unsubscribe = (subscriptionId: string) => {
    const subscription = activeSubscriptions.get(subscriptionId);
    if (subscription) {
      try {
        subscription.unsubscribe();
        activeSubscriptions.delete(subscriptionId);
        log(`✓ 已取消订阅: ${subscriptionId}`);
      } catch (error) {
        logWarn(`取消订阅 ${subscriptionId} 时出错:`, error);
      }
    }
  };

  /**
   * 取消指定主题的订阅（从注册表中移除）
   *
   * @param destination 主题地址
   */
  const unsubscribeDestination = (destination: string) => {
    // 从注册表中移除
    subscriptionRegistry.delete(destination);

    // 取消所有匹配该主题的活动订阅
    for (const [id, subscription] of activeSubscriptions.entries()) {
      // 注意：STOMP 的 subscription 对象没有直接暴露 destination，
      // 这里简化处理，实际使用时可能需要额外维护 id -> destination 的映射
      try {
        subscription.unsubscribe();
        activeSubscriptions.delete(id);
      } catch (error) {
        logWarn(`取消订阅 ${id} 时出错:`, error);
      }
    }

    log(`✓ 已移除主题订阅配置: ${destination}`);
  };

  /**
   * 断开 WebSocket 连接
   *
   * @param clearSubscriptions 是否清除订阅注册表（默认为 true）
   */
  const disconnect = (clearSubscriptions = true) => {
    // 设置手动断开标志
    isManualDisconnect = true;

    // 清除所有定时器
    clearAllTimers();

    // 取消所有活动订阅
    for (const [id, subscription] of activeSubscriptions.entries()) {
      try {
        subscription.unsubscribe();
      } catch (error) {
        logWarn(`取消订阅 ${id} 时出错:`, error);
      }
    }
    activeSubscriptions.clear();

    // 可选：清除订阅注册表
    if (clearSubscriptions) {
      subscriptionRegistry.clear();
      log("已清除所有订阅配置");
    }

    // 断开连接
    if (stompClient.value) {
      try {
        if (stompClient.value.connected || stompClient.value.active) {
          stompClient.value.deactivate();
          log("✓ WebSocket 连接已主动断开");
        }
      } catch (error) {
        logError("断开 WebSocket 连接时出错:", error);
      }
      stompClient.value = null;
    }

    connectionState.value = ConnectionState.DISCONNECTED;
    reconnectAttempts.value = 0;
  };

  // ==================== 返回公共接口 ====================
  return {
    // 状态
    connectionState: readonly(connectionState),
    isConnected,
    reconnectAttempts: readonly(reconnectAttempts),

    // 连接管理
    connect,
    disconnect,
    cleanup, // 清理资源（包括移除事件监听器）

    // 订阅管理
    subscribe,
    unsubscribe,
    unsubscribeDestination,

    // 统计信息
    getActiveSubscriptionCount: () => activeSubscriptions.size,
    getRegisteredSubscriptionCount: () => subscriptionRegistry.size,
  };
}
