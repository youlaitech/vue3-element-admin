import { AuthStorage } from "@/utils/auth";

export interface UseSseOptions {
  /** SSE 端点 URL，不传时使用环境变量拼接 */
  url?: string;
  /** 是否开启调试日志 */
  debug?: boolean;
  /** 连接超时时间，单位毫秒，默认为 10000 */
  connectionTimeout?: number;
}

type EventHandler = (data: any) => void;

/**
 * SSE 连接状态枚举
 */
export enum SseConnectionState {
  DISCONNECTED = "DISCONNECTED",
  CONNECTING = "CONNECTING",
  CONNECTED = "CONNECTED",
}

/**
 * 全局 SSE 实例管理
 */
let globalInstance: ReturnType<typeof createSseConnection> | null = null;

/**
 * 创建 SSE 连接（内部工厂函数）
 */
function createSseConnection(options: UseSseOptions = {}) {
  // 使用环境变量拼接 SSE URL：/dev-api/api/v1/sse/connect 或 /prod-api/api/v1/sse/connect
  const baseApi = import.meta.env.VITE_APP_BASE_API || "/dev-api";
  const defaultUrl = `${baseApi}/api/v1/sse/connect`;
  const config = {
    url: options.url ?? defaultUrl,
    debug: options.debug ?? false,
    connectionTimeout: options.connectionTimeout ?? 10000,
  };

  // 状态管理
  const connectionState = ref<SseConnectionState>(SseConnectionState.DISCONNECTED);
  const isConnected = computed(() => connectionState.value === SseConnectionState.CONNECTED);

  // EventSource 实例
  let eventSource: EventSource | null = null;
  let isManualDisconnect = false;
  let connectionTimeoutTimer: ReturnType<typeof setTimeout> | null = null;

  // 事件处理器注册表
  const eventHandlers = new Map<string, Set<EventHandler>>();

  // 日志
  const log = config.debug ? (...args: any[]) => console.log("[SSE]", ...args) : () => {};
  const logError = (...args: any[]) => console.error("[SSE]", ...args);

  /**
   * 清除连接超时定时器
   */
  const clearConnectionTimeout = () => {
    if (connectionTimeoutTimer) {
      clearTimeout(connectionTimeoutTimer);
      connectionTimeoutTimer = null;
    }
  };

  /**
   * 处理连接打开事件
   */
  const handleOpen = () => {
    clearConnectionTimeout();
    connectionState.value = SseConnectionState.CONNECTED;
    log("SSE 连接已建立");
  };

  /**
   * 处理连接错误事件
   */
  const handleError = (event: Event) => {
    clearConnectionTimeout();
    connectionState.value = SseConnectionState.DISCONNECTED;
    logError("SSE 连接错误:", event);

    // 非手动断开时，浏览器会自动重连
    if (!isManualDisconnect && eventSource) {
      log("浏览器将自动重连...");
    }
  };

  /**
   * 处理消息事件（默认 message 类型）
   */
  const handleMessage = (event: MessageEvent) => {
    log("收到消息:", event.data);
    const handlers = eventHandlers.get("message");
    if (handlers) {
      try {
        const data = JSON.parse(event.data);
        handlers.forEach((handler) => handler(data));
      } catch {
        handlers.forEach((handler) => handler(event.data));
      }
    }
  };

  /**
   * 处理自定义事件
   */
  const handleCustomEvent = (eventName: string) => (event: MessageEvent) => {
    log(`收到事件[${eventName}]:`, event.data);
    const handlers = eventHandlers.get(eventName);
    if (handlers) {
      try {
        const data = JSON.parse(event.data);
        handlers.forEach((handler) => handler(data));
      } catch {
        handlers.forEach((handler) => handler(event.data));
      }
    }
  };

  /**
   * 建立 SSE 连接
   */
  const connect = () => {
    // 重置手动断开标志
    isManualDisconnect = false;

    // 检查是否已连接或正在连接
    if (eventSource && connectionState.value === SseConnectionState.CONNECTED) {
      log("SSE 已连接，跳过重复连接");
      return;
    }

    if (connectionState.value === SseConnectionState.CONNECTING) {
      log("SSE 正在连接中，跳过重复连接");
      return;
    }

    // 检查 Token
    const token = AuthStorage.getAccessToken();
    if (!token) {
      log("未检测到有效令牌，跳过 SSE 连接");
      return;
    }

    // 设置连接状态
    connectionState.value = SseConnectionState.CONNECTING;

    // 构建 URL（带 Token）
    const separator = config.url.includes("?") ? "&" : "?";
    const fullUrl = `${config.url}${separator}token=${encodeURIComponent(token)}`;

    // 创建 EventSource
    eventSource = new EventSource(fullUrl);

    // 设置连接超时
    connectionTimeoutTimer = setTimeout(() => {
      if (connectionState.value === SseConnectionState.CONNECTING) {
        log("SSE 连接超时");
        disconnect();
      }
    }, config.connectionTimeout);

    // 注册事件监听器
    eventSource.onopen = handleOpen;
    eventSource.onerror = handleError;
    eventSource.onmessage = handleMessage;

    log("正在建立 SSE 连接...");
  };

  /**
   * 订阅事件
   *
   * @param eventName 事件名称（如 "dict"、"online-count"）
   * @param handler 事件处理函数
   * @returns 取消订阅的函数
   */
  const on = (eventName: string, handler: EventHandler): (() => void) => {
    if (!eventHandlers.has(eventName)) {
      eventHandlers.set(eventName, new Set());
    }
    eventHandlers.get(eventName)!.add(handler);

    // 如果是自定义事件（非 message），需要注册监听器
    if (eventName !== "message" && eventSource) {
      eventSource.addEventListener(eventName, handleCustomEvent(eventName) as EventListener);
    }

    log(`已订阅事件: ${eventName}`);

    // 返回取消订阅函数
    return () => {
      const handlers = eventHandlers.get(eventName);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          eventHandlers.delete(eventName);
        }
      }
      log(`已取消订阅事件: ${eventName}`);
    };
  };

  /**
   * 断开 SSE 连接
   */
  const disconnect = () => {
    isManualDisconnect = true;
    clearConnectionTimeout();

    if (eventSource) {
      eventSource.close();
      eventSource = null;
      log("SSE 连接已断开");
    }

    connectionState.value = SseConnectionState.DISCONNECTED;
  };

  /**
   * 清理资源
   */
  const cleanup = () => {
    disconnect();
    eventHandlers.clear();
    log("SSE 资源已清理");
  };

  return {
    // 状态
    connectionState: readonly(connectionState),
    isConnected,

    // 方法
    connect,
    disconnect,
    cleanup,
    on,
  };
}

/**
 * SSE 连接组合式函数（单例模式）
 */
export function useSse(options: UseSseOptions = {}) {
  if (!globalInstance) {
    globalInstance = createSseConnection(options);
  }
  return globalInstance;
}

/**
 * 获取或创建 SSE 实例（用于外部访问）
 */
export function getSseInstance() {
  return globalInstance;
}

/**
 * 清理全局 SSE 实例
 */
export function cleanupSse() {
  if (globalInstance) {
    globalInstance.cleanup();
    globalInstance = null;
  }
}
