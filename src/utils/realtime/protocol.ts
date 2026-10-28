/**
 * 实时消息协议版本。
 */
export const REALTIME_PROTOCOL_VERSION = 1 as const;
/**
 * 可订阅的业务主题。
 */
export const REALTIME_TOPICS = ["notice", "dict", "presence"] as const;

/**
 * 客户端可订阅的实时主题。
 */
export type RealtimeTopic = (typeof REALTIME_TOPICS)[number];
/**
 * 实时连接使用的客户端平台标识。
 */
export type RealtimeClientPlatform = "web" | "mp-weixin" | "app";

/**
 * 申请握手票据的客户端信息与订阅主题。
 */
export interface CreateRealtimeTicketRequest {
  readonly clientInstanceId: string;
  readonly platform: RealtimeClientPlatform;
  readonly topics: readonly RealtimeTopic[];
}

/**
 * 一次性握手票据。
 */
export interface RealtimeTicketResponse {
  readonly ticket: string;
}

/**
 * 节点在线统计，用户数按用户 ID 去重。
 */
export interface PresenceSnapshot {
  readonly onlineUsers: number;
  readonly onlineConnections: number;
  readonly nodeId: string;
  readonly observedAt: string;
}

/**
 * 服务端消息及各类业务载荷。
 */
export type RealtimeServerMessage = {
  readonly version: typeof REALTIME_PROTOCOL_VERSION;
  readonly id: string;
} & (
  | { readonly type: "connection.ready"; readonly payload: { readonly heartbeatTimeoutMs: number } }
  | { readonly type: "heartbeat.ping"; readonly payload: Readonly<Record<string, never>> }
  | {
      readonly type: "notice.changed";
      readonly payload: { readonly noticeId: string; readonly action: "published" | "revoked" };
    }
  | { readonly type: "dict.changed"; readonly payload: { readonly dictCode: string } }
  | { readonly type: "presence.snapshot"; readonly payload: PresenceSnapshot }
);

/**
 * 客户端对指定心跳的应答。
 */
export interface HeartbeatPongMessage {
  readonly version: typeof REALTIME_PROTOCOL_VERSION;
  readonly type: "heartbeat.pong";
  readonly payload: { readonly pingId: string };
}
/**
 * 通知发布或撤回的变更消息。
 */
export type NoticeChangedMessage = Extract<RealtimeServerMessage, { type: "notice.changed" }>;

/**
 * 拒绝服务端消息的校验原因。
 */
type RejectionReason =
  | "message-too-large"
  | "invalid-json"
  | "invalid-metadata"
  | "unsupported-version"
  | "invalid-payload";

/**
 * 区分有效消息、未知类型与协议错误的解析结果。
 */
export type ParseRealtimeMessageResult =
  | { readonly kind: "message"; readonly message: RealtimeServerMessage }
  | { readonly kind: "ignored"; readonly reason: "unknown-message-type" }
  | { readonly kind: "rejected"; readonly reason: RejectionReason };

/**
 * 握手票据响应的校验结果。
 */
export type ParseRealtimeTicketResult =
  | { readonly kind: "success"; readonly value: RealtimeTicketResponse }
  | { readonly kind: "rejected"; readonly reason: "invalid-ticket-response" };

const MAX_MESSAGE_BYTES = 16_384;
const MAX_TIMER_DELAY_MS = 2_147_483_647;

/**
 * 判断输入是否为非空、非数组对象。
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * 校验文本长度及首尾空白。
 */
function isText(value: unknown, maximumLength = 128): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= maximumLength &&
    value.trim() === value
  );
}

/**
 * 校验非负安全整数。
 */
function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

/**
 * 校验可用于定时器的正整数毫秒数。
 */
function isTimerDelay(value: unknown): value is number {
  return isNonNegativeInteger(value) && value > 0 && value <= MAX_TIMER_DELAY_MS;
}

/**
 * 校验 UTC 时间及日期有效性。
 */
function isUtcTimestamp(value: unknown): value is string {
  if (typeof value !== "string") return false;

  const match = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(?:\.(\d{1,3}))?Z$/.exec(value);
  if (!match?.[1]) return false;

  const milliseconds = Date.parse(value);
  if (!Number.isFinite(milliseconds)) return false;

  const normalized = `${match[1]}.${(match[2] ?? "").padEnd(3, "0")}Z`;
  return new Date(milliseconds).toISOString() === normalized;
}

/**
 * 计算 UTF-8 字节数，超过消息上限时提前结束。
 */
function utf8ByteLength(value: string): number {
  let bytes = 0;
  for (const point of value) {
    const code = point.codePointAt(0) ?? 0;
    bytes += code < 0x80 ? 1 : code < 0x800 ? 2 : code < 0x10000 ? 3 : 4;
    if (bytes > MAX_MESSAGE_BYTES) break;
  }
  return bytes;
}

/**
 * 解析并校验服务端消息，业务层只接收可信结构。
 */
export function parseRealtimeServerMessage(text: string): ParseRealtimeMessageResult {
  if (utf8ByteLength(text) > MAX_MESSAGE_BYTES) {
    return { kind: "rejected", reason: "message-too-large" };
  }

  let decoded: unknown;
  try {
    decoded = JSON.parse(text);
  } catch {
    return { kind: "rejected", reason: "invalid-json" };
  }

  if (!isRecord(decoded)) return { kind: "rejected", reason: "invalid-metadata" };
  if (decoded["version"] !== REALTIME_PROTOCOL_VERSION) {
    return { kind: "rejected", reason: "unsupported-version" };
  }

  const id = decoded["id"];
  const type = decoded["type"];
  const payload = decoded["payload"];
  if (!isText(id) || !isText(type) || !isRecord(payload)) {
    return { kind: "rejected", reason: "invalid-metadata" };
  }

  const metadata = {
    version: REALTIME_PROTOCOL_VERSION,
    id,
  };
  const invalid: ParseRealtimeMessageResult = {
    kind: "rejected",
    reason: "invalid-payload",
  };

  switch (type) {
    case "connection.ready": {
      const heartbeatTimeoutMs = payload["heartbeatTimeoutMs"];
      if (!isTimerDelay(heartbeatTimeoutMs)) return invalid;
      return {
        kind: "message",
        message: {
          ...metadata,
          type,
          payload: { heartbeatTimeoutMs },
        },
      };
    }
    case "heartbeat.ping":
      return { kind: "message", message: { ...metadata, type, payload: {} } };
    case "notice.changed": {
      const noticeId = payload["noticeId"];
      const action = payload["action"];
      if (!isText(noticeId) || (action !== "published" && action !== "revoked")) return invalid;
      return { kind: "message", message: { ...metadata, type, payload: { noticeId, action } } };
    }
    case "dict.changed": {
      const dictCode = payload["dictCode"];
      if (!isText(dictCode)) return invalid;
      return { kind: "message", message: { ...metadata, type, payload: { dictCode } } };
    }
    case "presence.snapshot": {
      const onlineUsers = payload["onlineUsers"];
      const onlineConnections = payload["onlineConnections"];
      const nodeId = payload["nodeId"];
      const observedAt = payload["observedAt"];
      if (
        !isNonNegativeInteger(onlineUsers) ||
        !isNonNegativeInteger(onlineConnections) ||
        onlineUsers > onlineConnections ||
        !isText(nodeId) ||
        !isUtcTimestamp(observedAt)
      ) {
        return invalid;
      }
      return {
        kind: "message",
        message: {
          ...metadata,
          type,
          payload: {
            onlineUsers,
            onlineConnections,
            nodeId,
            observedAt,
          },
        },
      };
    }
    default:
      return { kind: "ignored", reason: "unknown-message-type" };
  }
}

/**
 * 校验领票接口，避免无效数据进入连接流程。
 */
export function parseRealtimeTicket(value: unknown): ParseRealtimeTicketResult {
  const invalid: ParseRealtimeTicketResult = {
    kind: "rejected",
    reason: "invalid-ticket-response",
  };
  if (!isRecord(value)) return invalid;

  const ticket = value["ticket"];
  if (typeof ticket !== "string" || !/^[A-Za-z0-9_-]{43,256}$/.test(ticket)) {
    return invalid;
  }
  return { kind: "success", value: { ticket } };
}

/**
 * 生成对应服务端心跳的应答消息。
 */
export function createHeartbeatPong(pingId: string): HeartbeatPongMessage {
  return {
    version: REALTIME_PROTOCOL_VERSION,
    type: "heartbeat.pong",
    payload: { pingId },
  };
}
