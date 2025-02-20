import { Client } from "@stomp/stompjs";
import { getToken } from "@/utils/auth";

class WebSocketManager {
  private client: Client | null = null;
  private messageHandlers: Map<string, ((message: string) => void)[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3; // 自定义最大重试次数
  private reconnectDelay = 5000; // 重试延迟（单位：毫秒）

  // 初始化 WebSocket 客户端
  setupWebSocket() {
    const endpoint = import.meta.env.VITE_APP_WS_ENDPOINT;

    // 如果没有配置 WebSocket 端点或显式关闭，直接返回
    if (!endpoint) {
      console.log("WebSocket 已被禁用，如需打开请在配置文件中配置 VITE_APP_WS_ENDPOINT");
      return;
    }

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
      reconnectDelay: 0, // 设置为 0 禁用重连
      onConnect: () => {
        console.log(`连接到 WebSocket 服务器: ${endpoint}`);
        this.reconnectAttempts = 0; // 重置重连计数
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
        this.reconnectAttempts++;
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          console.log(`正在尝试重连... 尝试次数: ${this.reconnectAttempts}`);
        } else {
          console.log("重连次数已达上限，停止重连");
          this.client?.deactivate();
        }
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
