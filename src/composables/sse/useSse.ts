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
  const baseApi = import.meta.env.VITE_APP_BASE_API || "/dev-api";
  const defaultUrl = `${baseApi}/api/v1/sse/connect`;
  const config = {
    url: options.url ?? defaultUrl,
    debug: options.debug ?? false,
    connectionTimeout: options.connectionTimeout ?? 10000,
  };

  const connectionState = ref<SseConnectionState>(SseConnectionState.DISCONNECTED);
  const isConnected = computed(() => connectionState.value === SseConnectionState.CONNECTED);

  let eventSource: EventSource | null = null;
  let abortController: AbortController | null = null;
  let isManualDisconnect = false;
  let connectionTimeoutTimer: ReturnType<typeof setTimeout> | null = null;
  let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

  const eventHandlers = new Map<string, Set<EventHandler>>();

  const log = config.debug ? (...args: any[]) => console.log("[SSE]", ...args) : () => {};
  const logError = (...args: any[]) => console.error("[SSE]", ...args);

  const clearConnectionTimeout = () => {
    if (connectionTimeoutTimer) {
      clearTimeout(connectionTimeoutTimer);
      connectionTimeoutTimer = null;
    }
  };

  const handleOpen = () => {
    clearConnectionTimeout();
    connectionState.value = SseConnectionState.CONNECTED;
    log("SSE 连接已建立");
  };

  const handleError = (event: Event) => {
    clearConnectionTimeout();
    connectionState.value = SseConnectionState.DISCONNECTED;
    logError("SSE 连接错误:", event);

    if (!isManualDisconnect && eventSource) {
      log("浏览器将自动重连...");
    }
  };

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

  const connect = () => {
    isManualDisconnect = false;

    if (connectionState.value === SseConnectionState.CONNECTED) {
      log("SSE 已连接，跳过重复连接");
      return;
    }

    if (connectionState.value === SseConnectionState.CONNECTING) {
      log("SSE 正在连接中，跳过重复连接");
      return;
    }

    const token = AuthStorage.getAccessToken();
    if (!token) {
      log("未检测到有效令牌，跳过 SSE 连接");
      return;
    }

    connectionState.value = SseConnectionState.CONNECTING;

    // 使用 fetch + ReadableStream 替代 EventSource，支持 Authorization header
    abortController = new AbortController();

    connectionTimeoutTimer = setTimeout(() => {
      if (connectionState.value === SseConnectionState.CONNECTING) {
        log("SSE 连接超时");
        disconnect();
      }
    }, config.connectionTimeout);

    fetch(config.url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "text/event-stream",
      },
      signal: abortController.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        clearConnectionTimeout();
        connectionState.value = SseConnectionState.CONNECTED;
        log("SSE 连接已建立");
        return response.body?.getReader();
      })
      .then((r) => {
        if (!r) return;
        reader = r;
        const decoder = new TextDecoder();
        let buffer = "";

        const processChunk = ({
          done,
          value,
        }: ReadableStreamReadResult<Uint8Array>): Promise<void> | void => {
          if (done) {
            connectionState.value = SseConnectionState.DISCONNECTED;
            log("SSE 连接已关闭");
            return;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || ""; // 保留不完整的行

          let currentEvent = "message";
          let currentData = "";

          for (const line of lines) {
            if (line.startsWith(":")) continue; // 注释行（心跳）
            if (line.startsWith("event:")) {
              currentEvent = line.slice(6).trim();
            } else if (line.startsWith("data:")) {
              currentData = line.slice(5).trim();
            } else if (line === "") {
              // 空行表示事件结束
              if (currentData) {
                const handlers = eventHandlers.get(currentEvent);
                if (handlers) {
                  try {
                    const data = JSON.parse(currentData);
                    handlers.forEach((h) => h(data));
                  } catch {
                    handlers.forEach((h) => h(currentData));
                  }
                }
                log(`收到事件[${currentEvent}]:`, currentData);
              }
              currentEvent = "message";
              currentData = "";
            }
          }

          return reader!.read().then(processChunk);
        };

        return reader.read().then(processChunk);
      })
      .catch((err) => {
        if (err.name === "AbortError") {
          log("SSE 连接已主动断开");
        } else {
          logError("SSE 连接错误:", err);
          connectionState.value = SseConnectionState.DISCONNECTED;
        }
      });

    log("正在建立 SSE 连接...");
  };

  const on = (eventName: string, handler: EventHandler): (() => void) => {
    if (!eventHandlers.has(eventName)) {
      eventHandlers.set(eventName, new Set());
    }
    eventHandlers.get(eventName)!.add(handler);

    log(`已订阅事件: ${eventName}`);

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

  const disconnect = () => {
    isManualDisconnect = true;
    clearConnectionTimeout();

    if (reader) {
      reader.cancel();
      reader = null;
    }
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }

    connectionState.value = SseConnectionState.DISCONNECTED;
    log("SSE 连接已断开");
  };

  const cleanup = () => {
    disconnect();
    eventHandlers.clear();
    log("SSE 资源已清理");
  };

  return {
    connectionState: readonly(connectionState),
    isConnected,
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
