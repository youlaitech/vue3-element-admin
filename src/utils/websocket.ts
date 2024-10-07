import { Client } from "@stomp/stompjs";
import { getToken } from "@/utils/auth";

class WebSocketManager {
  private client: Client | null = null;
  private messageHandlers: Map<string, ((message: string) => void)[]> =
    new Map();

  constructor() {}

  // 初始化 WebSocket 客户端
  setupWebSocket() {
    const endpoint = import.meta.env.VITE_APP_WS_ENDPOINT;

    if (this.client && this.client.connected) {
      console.log("客户端已存在并且连接正常");
      return this.client;
    }

    this.client = new Client({
      brokerURL: endpoint,
      connectHeaders: {
        Authorization: getToken(),
      },
      heartbeatIncoming: 30000,
      heartbeatOutgoing: 30000,
      onConnect: () => {
        console.log(`连接到 WebSocket 服务器: ${endpoint}`);
        this.messageHandlers.forEach((handlers, topic) => {
          handlers.forEach((handler) => {
            this.subscribeToTopic(topic, handler);
          });
        });
      },
      onStompError: (frame) => {
        console.error(`连接错误: ${frame.headers["message"]}`);
        console.error(`错误详情: ${frame.body}`);
      },
      onDisconnect: () => {
        console.log(`WebSocket 连接已断开: ${endpoint}`);
      },
    });

    this.client.activate();
  }

  // 订阅主题
  public subscribeToTopic(topic: string, onMessage: (message: string) => void) {
    console.log(`正在订阅主题: ${topic}`);
    if (!this.client || !this.client.connected) {
      this.setupWebSocket();
    }

    if (this.messageHandlers.has(topic)) {
      this.messageHandlers.get(topic)?.push(onMessage);
    } else {
      this.messageHandlers.set(topic, [onMessage]);
    }

    if (this.client?.connected) {
      this.client.subscribe(topic, (message) => {
        const handlers = this.messageHandlers.get(topic);
        handlers?.forEach((handler) => handler(message.body));
      });
    }
  }

  // 断开 WebSocket 连接
  public disconnect() {
    if (this.client) {
      console.log("断开 WebSocket 连接");
      this.client.deactivate();
      this.client = null;
    }
  }
}

export default new WebSocketManager();
