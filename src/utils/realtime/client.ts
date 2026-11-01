import { readonly, shallowRef } from "vue";
import { createHeartbeatPong, parseRealtimeServerMessage } from "./protocol";
import type {
  CreateRealtimeTicketRequest,
  RealtimeServerMessage,
  RealtimeTicketResponse,
  RealtimeTopic,
} from "./protocol";

/**
 * 实时连接对外显示的状态。
 */
export enum RealtimeConnectionStatus {
  DISCONNECTED = "disconnected",
  CONNECTING = "connecting",
  CONNECTED = "connected",
}

/**
 * 连接客户端所需的票据申请接口，null 表示服务未启用或无权连接。
 */
interface RealtimeClientOptions {
  readonly requestTicket: (
    request: CreateRealtimeTicketRequest,
  ) => Promise<RealtimeTicketResponse | null>;
}

/**
 * 一次连接尝试持有的 Socket 与超时状态。
 */
interface ConnectionAttempt {
  socket: WebSocket | null;
  timer: ReturnType<typeof setTimeout> | null;
  deadline: number;
  heartbeatTimeout: number;
  connectedAt: number;
}

type MessageHandler = (message: RealtimeServerMessage) => void;

const MAX_RECONNECT_ATTEMPTS = 10;
// 从未握手成功时只重试两次，服务端不可用时直接停止
const MAX_HANDSHAKE_ATTEMPTS = 2;
const MAX_BUFFERED_BYTES = 16_384;
const STOP_RECONNECT_CODES = new Set([1000, 1008, 1009, 4003, 4009]);

/**
 * 将一次性票据写入 WebSocket 握手地址。
 */
function createWebSocketUrl(ticket: string): string {
  const address = new URL("/api/v1/realtime/ws", window.location.origin);
  address.protocol = address.protocol === "https:" ? "wss:" : "ws:";
  address.searchParams.set("ticket", ticket);
  return address.toString();
}

/**
 * 一次有效连接、一个重连任务；所有迟到回调都受 attempt 身份约束。
 */
export function createRealtimeClient(options: RealtimeClientOptions) {
  const status = shallowRef<RealtimeConnectionStatus>(RealtimeConnectionStatus.DISCONNECTED);
  const handlers = new Set<MessageHandler>();
  const clientInstanceId = `client_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
  let current: ConnectionAttempt | null = null;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;
  let retryCount = 0;
  let enabled = false;
  // 服务未启用、协议或权限拒绝后暂停恢复，由 disconnect 重置。
  let blocked = false;
  let topics: readonly RealtimeTopic[] = ["notice"];

  /**
   * 按对象身份识别当前连接，隔离旧连接的回调。
   */
  function isCurrent(attempt: ConnectionAttempt): boolean {
    return current === attempt;
  }

  /**
   * 逐个分发消息，隔离订阅者异常。
   */
  function notify(message: RealtimeServerMessage): void {
    for (const handler of handlers) {
      try {
        handler(message);
      } catch {
        console.error("[Realtime] 消息处理失败");
      }
    }
  }

  /**
   * 按退避间隔安排重连，最多保留一个待执行任务。
   */
  function scheduleRetry(minimumDelay = 0): void {
    if (!enabled || blocked || retryTimer !== null) return;
    if (retryCount >= MAX_RECONNECT_ATTEMPTS) {
      enabled = false;
      return;
    }
    // 指数退避叠加随机延迟，避免网络恢复时大量客户端同时重连。
    const maximum = Math.min(1_000 * 2 ** retryCount++, 30_000);
    const delay = Math.max(minimumDelay, maximum / 2 + (Math.random() * maximum) / 2);
    retryTimer = setTimeout(() => {
      retryTimer = null;
      void start();
    }, delay);
  }

  /**
   * 结束本次连接尝试，最多安排一次重连。
   */
  function finish(attempt: ConnectionAttempt, retry: boolean, code = 4000, minimumDelay = 0): void {
    if (!isCurrent(attempt)) return;
    // 稳定在线后才重置预算，短暂连上不能使快速失败无限重试。
    if (attempt.connectedAt && Date.now() - attempt.connectedAt >= 30_000) retryCount = 0;
    current = null;
    if (attempt.timer !== null) clearTimeout(attempt.timer);
    status.value = RealtimeConnectionStatus.DISCONNECTED;
    const socket = attempt.socket;
    if (socket) {
      socket.onopen = null;
      socket.onmessage = null;
      socket.onerror = null;
      socket.onclose = null;
      try {
        if (socket.readyState === WebSocket.OPEN) socket.close(code);
        else if (socket.readyState === WebSocket.CONNECTING) socket.close();
      } catch {
        // 回调已失效，底层关闭失败不会产生第二条恢复链。
      }
    }
    if (!retry && enabled) blocked = true;
    // 从未连上时快速放弃，避免服务端不可用时反复重连
    if (retry && !attempt.connectedAt && retryCount >= MAX_HANDSHAKE_ATTEMPTS) {
      enabled = false;
      blocked = true;
      return;
    }
    if (retry) scheduleRetry(minimumDelay);
  }

  /**
   * 检查连接期限，超时后结束本次尝试。
   */
  function checkDeadline(attempt: ConnectionAttempt): boolean {
    if (!isCurrent(attempt)) return false;
    if (Date.now() < attempt.deadline) return true;
    finish(attempt, true, status.value === RealtimeConnectionStatus.CONNECTED ? 4011 : 4000);
    return false;
  }

  /**
   * 建连后将同一个定时器改为检查心跳期限。
   */
  function armDeadline(attempt: ConnectionAttempt): void {
    if (!isCurrent(attempt)) return;
    if (attempt.timer !== null) clearTimeout(attempt.timer);
    attempt.timer = setTimeout(
      () => {
        attempt.timer = null;
        if (checkDeadline(attempt)) armDeadline(attempt);
      },
      Math.min(Math.max(1, attempt.deadline - Date.now()), 2_147_483_647),
    );
  }

  /**
   * 应答服务端心跳，发送失败时结束本次连接。
   */
  function sendPong(attempt: ConnectionAttempt, pingId: string): boolean {
    if (!isCurrent(attempt)) return false;
    const socket = attempt.socket;
    if (
      !socket ||
      socket.readyState !== WebSocket.OPEN ||
      socket.bufferedAmount > MAX_BUFFERED_BYTES
    ) {
      finish(attempt, true, 4010, 60_000);
      return false;
    }
    try {
      socket.send(JSON.stringify(createHeartbeatPong(pingId)));
      return true;
    } catch {
      finish(attempt, true);
      return false;
    }
  }

  /**
   * 确认连接就绪、应答心跳并分发业务消息。
   */
  function handleMessage(attempt: ConnectionAttempt, data: unknown): void {
    if (!checkDeadline(attempt)) return;
    if (typeof data !== "string") {
      finish(attempt, false);
      return;
    }
    const result = parseRealtimeServerMessage(data);
    if (result.kind === "ignored") return;
    if (result.kind === "rejected") {
      console.warn(`[Realtime] 协议校验失败：${result.reason}`);
      finish(attempt, false);
      return;
    }
    const message = result.message;
    if (message.type === "connection.ready") {
      if (status.value !== RealtimeConnectionStatus.CONNECTING) {
        finish(attempt, false);
        return;
      }
      attempt.heartbeatTimeout = message.payload.heartbeatTimeoutMs;
      attempt.deadline = Date.now() + attempt.heartbeatTimeout;
      attempt.connectedAt = Date.now();
      status.value = RealtimeConnectionStatus.CONNECTED;
      armDeadline(attempt);
    } else if (message.type === "heartbeat.ping") {
      if (status.value !== RealtimeConnectionStatus.CONNECTED) {
        finish(attempt, false);
        return;
      }
      attempt.deadline = Date.now() + attempt.heartbeatTimeout;
      if (!sendPong(attempt, message.id)) return;
      armDeadline(attempt);
    } else if (status.value !== RealtimeConnectionStatus.CONNECTED) {
      // 就绪前的业务提示由连接成功后的 HTTP 补拉覆盖。
      return;
    }
    notify(message);
  }

  /**
   * 领取票据并建立连接，忽略过期尝试的回调。
   */
  async function start(): Promise<void> {
    if (!enabled || blocked || current) return;
    const attempt: ConnectionAttempt = {
      socket: null,
      timer: null,
      deadline: Date.now() + 10_000,
      heartbeatTimeout: 0,
      connectedAt: 0,
    };
    current = attempt;
    status.value = RealtimeConnectionStatus.CONNECTING;
    // 领票与握手共用总超时，领票悬挂也会结束本次尝试。
    armDeadline(attempt);
    try {
      const ticket = await options.requestTicket({ clientInstanceId, platform: "web", topics });
      if (!checkDeadline(attempt)) return;
      if (ticket === null) {
        finish(attempt, false);
        return;
      }
      const socket = new WebSocket(createWebSocketUrl(ticket.ticket));
      attempt.socket = socket;
      socket.onmessage = (event: MessageEvent<unknown>) => handleMessage(attempt, event.data);
      // 浏览器的 error 后跟随 close；在 close 中统一决定恢复，避免丢失关闭码。
      socket.onerror = () => {};
      socket.onclose = (event) => {
        const retry = !STOP_RECONNECT_CODES.has(event.code);
        const cooldown = event.code === 4010 ? 60_000 : event.code === 4008 ? 30_000 : 0;
        finish(attempt, retry, 4000, cooldown);
      };
    } catch {
      finish(attempt, true);
    }
  }

  /**
   * 重复调用只检查健康；改变主题时先结束旧连接。
   */
  function connect(nextTopics: readonly RealtimeTopic[] = ["notice"]): void {
    const desired = [...new Set<RealtimeTopic>(["notice", ...nextTopics])].sort();
    if (topics.join() !== desired.join()) disconnect();
    topics = desired;
    if (blocked) return;
    if (current) {
      checkDeadline(current);
      return;
    }
    if (retryTimer !== null) return;
    enabled = true;
    void start();
  }

  /**
   * 停止连接并清理定时器与重连状态。
   */
  function disconnect(): void {
    enabled = false;
    blocked = false;
    retryCount = 0;
    if (retryTimer !== null) clearTimeout(retryTimer);
    retryTimer = null;
    if (current) finish(current, false, 1000);
    status.value = RealtimeConnectionStatus.DISCONNECTED;
  }

  /**
   * 注册消息处理器，并返回取消订阅函数。
   */
  function onMessage(handler: MessageHandler): () => void {
    handlers.add(handler);
    return () => {
      handlers.delete(handler);
    };
  }

  return { status: readonly(status), connect, disconnect, onMessage };
}
