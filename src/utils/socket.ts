import { Client } from "@stomp/stompjs";
import { getToken } from "@/utils/auth";

const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_DELAY_MS = 5000;
const HEARTBEAT_INTERVAL_MS = 30000;

class WebSocketManager {
  private client: Client | null = null;
  private reconnectAttempts: number = 0;
  private messageHandlers: Map<string, ((message: string) => void)[]> =
    new Map();

  constructor() {}

  private getOrCreateClient(onError?: (error: any) => void): Client {
    const endpoint = import.meta.env.VITE_APP_WS_ENDPOINT;

    if (this.client) {
      return this.client;
    }

    this.client = new Client({
      brokerURL: endpoint,
      connectHeaders: {
        Authorization: getToken(),
      },
      heartbeatIncoming: HEARTBEAT_INTERVAL_MS,
      heartbeatOutgoing: HEARTBEAT_INTERVAL_MS,
      onConnect: () => {
        console.log(`已连接到 WebSocket 服务器: ${endpoint}`);
        this.messageHandlers.forEach((handlers, topic) => {
          handlers.forEach((handler) => {
            this.subscribeToTopic(topic, handler);
          });
        });
      },
      onStompError: (frame) => {
        console.error(
          `连接错误: ${endpoint}, 错误消息: ${frame.headers["message"]}`
        );
        console.error(`错误详情: ${frame.body}`);
        if (onError) {
          onError(frame);
        }
        this.handleReconnect();
      },
      onDisconnect: () => {
        console.log(`已断开连接: ${endpoint}`);
        this.handleReconnect();
      },
    });

    this.client.activate();
    return this.client;
  }

  public subscribeToTopic(
    topic: string,
    onMessage: (message: string) => void,
    onError?: (error: any) => void
  ) {
    if (!this.client || !this.client.connected) {
      console.log("WebSocket 尚未连接，正在连接...");
      this.getOrCreateClient(onError);
    }

    if (this.messageHandlers.has(topic)) {
      this.messageHandlers.get(topic)?.push(onMessage);
    } else {
      this.messageHandlers.set(topic, [onMessage]);
    }

    if (this.client?.connected) {
      console.log(`正在订阅主题: ${topic}`);
      this.client.subscribe(topic, (message) => {
        const handlers = this.messageHandlers.get(topic);
        handlers?.forEach((handler) => handler(message.body));
      });
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      this.reconnectAttempts++;
      console.log(
        `重连尝试 (${this.reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`
      );

      setTimeout(() => {
        this.client?.deactivate();
        this.client = null;
        this.getOrCreateClient();
      }, RECONNECT_DELAY_MS);
    } else {
      console.error("达到最大重连次数，停止重连");
    }
  }

  public disconnect() {
    if (this.client) {
      console.log("断开 WebSocket 连接");
      this.client.deactivate();
      this.client = null;
    }
  }
}

export default new WebSocketManager();
