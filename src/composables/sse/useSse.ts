import { AuthStorage } from "@/utils/auth";

export interface UseSseOptions {
  url?: string; // SSE 连接地址，默认走 VITE_APP_BASE_API 代理
  debug?: boolean; // 是否在控制台打印调试日志
  connectionTimeout?: number; // 连接超时时间(ms)
  /** 重连间隔基数，实际间隔 = min(基数 × 2^n, 最大间隔) */
  reconnectInterval?: number;
  maxReconnectInterval?: number; // 重连间隔上限(ms)
  maxReconnectAttempts?: number; // 最大重试次数，超过后停止重连
}

type EventHandler = (data: any) => void;

export enum SseConnectionState {
  DISCONNECTED = "DISCONNECTED", // 未连接
  CONNECTING = "CONNECTING", // 连接中
  CONNECTED = "CONNECTED", // 已连接
}

let globalInstance: ReturnType<typeof createSseConnection> | null = null;

function createSseConnection(options: UseSseOptions = {}) {
  const baseUrl = import.meta.env.VITE_APP_BASE_API;
  const defaultUrl = `${baseUrl}/api/v1/sse/connect`;

  const config = {
    url: options.url ?? defaultUrl,
    debug: options.debug ?? false,
    connectionTimeout: options.connectionTimeout ?? 10000, // 连接超时 10s
    reconnectInterval: options.reconnectInterval ?? 5000, // 首次重连等 5s，之后翻倍
    maxReconnectInterval: options.maxReconnectInterval ?? 120000, // 重连间隔最大 2min
    maxReconnectAttempts: options.maxReconnectAttempts ?? 10, // 最多重试 10 次
  };

  const connectionState = ref<SseConnectionState>(SseConnectionState.DISCONNECTED);
  const isConnected = computed(() => connectionState.value === SseConnectionState.CONNECTED);

  let abortController: AbortController | null = null;
  let connectionTimeoutTimer: ReturnType<typeof setTimeout> | null = null;
  let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  let isManualDisconnect = false; // 主动断开则不重连
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let reconnectAttempts = 0;
  let currentReconnectInterval = config.reconnectInterval;

  const eventHandlers = new Map<string, Set<EventHandler>>();

  const log = (...args: any[]) => console.log("[SSE]", ...args);
  const logError = (...args: any[]) => console.error("[SSE]", ...args);

  const clearTimer = (timer: typeof connectionTimeoutTimer) => {
    if (timer) {
      clearTimeout(timer);
      return null;
    }
    return timer;
  };

  // 指数退避重连
  const scheduleReconnect = () => {
    if (isManualDisconnect) return;
    if (config.maxReconnectAttempts > 0 && reconnectAttempts >= config.maxReconnectAttempts) {
      log(`已达到最大重试次数 ${config.maxReconnectAttempts}，停止重连`);
      return;
    }

    reconnectAttempts++;
    log(`将在 ${currentReconnectInterval}ms 后重试（${reconnectAttempts}）`);

    reconnectTimer = setTimeout(() => {
      connect();
      currentReconnectInterval = Math.min(
        currentReconnectInterval * 2,
        config.maxReconnectInterval
      );
    }, currentReconnectInterval);
  };

  const connect = () => {
    isManualDisconnect = false;

    if (connectionState.value !== SseConnectionState.DISCONNECTED) {
      log(
        connectionState.value === SseConnectionState.CONNECTED
          ? "SSE 已连接，跳过重复连接"
          : "SSE 正在连接中，跳过重复连接"
      );
      return;
    }

    const token = AuthStorage.getAccessToken();
    if (!token) {
      log("未检测到有效令牌，跳过 SSE 连接");
      return;
    }

    connectionState.value = SseConnectionState.CONNECTING;
    abortController = new AbortController();

    // 超时自动断开
    connectionTimeoutTimer = setTimeout(() => {
      if (connectionState.value === SseConnectionState.CONNECTING) {
        log("SSE 连接超时");
        disconnect();
      }
    }, config.connectionTimeout);

    log("正在建立 SSE 连接...");

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
        connectionTimeoutTimer = clearTimer(connectionTimeoutTimer);
        connectionState.value = SseConnectionState.CONNECTED;
        reconnectAttempts = 0;
        currentReconnectInterval = config.reconnectInterval;
        log("SSE 连接已建立");
        return response.body?.getReader();
      })
      .then((r) => {
        if (!r) return;
        reader = r;
        const decoder = new TextDecoder();
        let buffer = "";

        // SSE 文本协议解析：event / data / 空行分隔
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
          buffer = lines.pop() || "";

          let currentEvent = "message";
          let currentData = "";

          for (const line of lines) {
            if (line.startsWith(":")) continue;
            if (line.startsWith("event:")) {
              currentEvent = line.slice(6).trim();
            } else if (line.startsWith("data:")) {
              currentData = line.slice(5).trim();
            } else if (line === "") {
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
          scheduleReconnect();
        }
      });
  };

  // 订阅事件，返回取消函数
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
    };
  };

  // 主动断开，不会触发重连
  const disconnect = () => {
    isManualDisconnect = true;
    connectionTimeoutTimer = clearTimer(connectionTimeoutTimer);
    reconnectTimer = clearTimer(reconnectTimer);
    reader?.cancel();
    reader = null;
    abortController?.abort();
    abortController = null;
    connectionState.value = SseConnectionState.DISCONNECTED;
    log("SSE 连接已断开");
  };

  // 登出时调用，断开并释放所有资源
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

export function useSse(options: UseSseOptions = {}) {
  if (!globalInstance) {
    globalInstance = createSseConnection(options);
  }
  return globalInstance;
}

export function cleanupSse() {
  if (globalInstance) {
    globalInstance.cleanup();
    globalInstance = null;
  }
}
