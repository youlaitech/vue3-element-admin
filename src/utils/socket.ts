import { Client } from "@stomp/stompjs";
import { getToken } from "@/utils/auth";

const MAX_RECONNECT_ATTEMPTS = 3; // 最大重连尝试次数
const RECONNECT_DELAY_MS = 5000; // 重连延迟时间（毫秒）
const HEARTBEAT_INTERVAL_MS = 30000; // 心跳间隔时间（毫秒）

class WebSocketManager {
  private clients: Map<string, Client> = new Map(); // 保存所有 WebSocket 客户端
  private reconnectAttempts: Map<string, number> = new Map(); // 记录各地址的重连次数
  private messageHandlers: Map<string, ((message: string) => void)[]> =
    new Map(); // 保存订阅的消息回调

  constructor() {}

  /**
   * 获取已有的 WebSocket 客户端
   *
   * @param endpoint WebSocket 连接地址
   * @returns WebSocket Client 实例或 undefined
   */
  public getClient(endpoint: string): Client | undefined {
    return this.clients.get(endpoint);
  }

  /**
   * 获取 WebSocket 客户端，如果已存在则返回已有客户端，否则创建新的客户端
   *
   * @param endpoint WebSocket 连接地址
   * @param onMessage 收到消息时的回调
   * @param onError 出现错误时的回调
   * @returns WebSocket Client 实例
   */
  public getOrCreateClient(
    endpoint: string,
    onMessage: (message: string) => void,
    onError?: (error: any) => void
  ): Client {
    let client = this.getClient(endpoint);
    if (client) {
      // 如果该地址已有连接，直接添加消息回调
      this.messageHandlers.get(endpoint)?.push(onMessage);
    } else {
      // 否则创建新客户端
      client = this.createClient(endpoint, onMessage, onError);
      this.clients.set(endpoint, client);
      this.messageHandlers.set(endpoint, [onMessage]);
    }
    return client;
  }

  /**
   * 创建 WebSocket 客户端
   *
   * @param endpoint WebSocket 连接地址
   * @param onMessage 收到消息时的回调
   * @param onError 出现错误时的回调
   * @returns WebSocket Client 实例
   * @private
   */
  private createClient(
    endpoint: string,
    onMessage: (message: string) => void,
    onError?: (error: any) => void
  ): Client {
    const client = new Client({
      brokerURL: endpoint, // 使用传入的 endpoint 动态设置连接地址
      connectHeaders: {
        Authorization: getToken(),
      },
      heartbeatIncoming: HEARTBEAT_INTERVAL_MS,
      heartbeatOutgoing: HEARTBEAT_INTERVAL_MS,
      onConnect: () => {
        console.log(`已连接到 ${endpoint}`);
        client.subscribe(endpoint, (message) => {
          onMessage(message.body); // 收到消息时调用回调
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
        this.handleReconnect(endpoint); // 出现错误时处理重连
      },
      onDisconnect: () => {
        console.log(`已断开连接: ${endpoint}`);
        this.handleReconnect(endpoint); // 断开时处理重连
      },
    });

    client.activate();
    return client;
  }

  /**
   * 处理 WebSocket 重连
   *
   * @param endpoint WebSocket 连接地址
   * @private
   */
  private handleReconnect(endpoint: string) {
    const attemptCount = this.reconnectAttempts.get(endpoint) || 0;

    if (this.clients.has(endpoint)) {
      const client = this.clients.get(endpoint);
      if (client && client.connected) {
        client.deactivate(); // 主动断开已有连接
      }
    }

    // 重连次数未达到最大次数时继续重连
    if (attemptCount < MAX_RECONNECT_ATTEMPTS) {
      this.reconnectAttempts.set(endpoint, attemptCount + 1);
      console.log(
        `尝试重连 (${attemptCount + 1}/${MAX_RECONNECT_ATTEMPTS}): ${endpoint}`
      );
      setTimeout(() => {
        const originalOnMessage = this.messageHandlers.get(endpoint) || [];
        this.getOrCreateClient(
          endpoint,
          (message) => originalOnMessage.forEach((handler) => handler(message)),
          () => {}
        );
      }, RECONNECT_DELAY_MS);
    } else {
      console.error(`达到最大重连次数: ${endpoint}`);
      this.reconnectAttempts.delete(endpoint); // 超过最大重连次数后清除重连记录
    }
  }

  /**
   * 断开所有 WebSocket 连接
   *
   * @param delay 延迟断开时间（毫秒），默认为 0
   */
  public disconnectAll(delay: number = 0) {
    this.clients.forEach((client, endpoint) => {
      console.log(`断开 WebSocket 连接: ${endpoint}`);
      setTimeout(() => client.deactivate(), delay); // 延迟断开连接
    });
    this.clients.clear();
    this.reconnectAttempts.clear();
  }
}

export default new WebSocketManager();
