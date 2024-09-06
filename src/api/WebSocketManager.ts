import { Client } from "@stomp/stompjs";
import { TOKEN_KEY } from "@/enums/CacheEnum";

const MAX_RETRIES = 3; // 最大重试次数
const RETRY_DELAY_MS = 5000; // 重试延迟时间，单位：毫秒
const HEARTBEAT_INTERVAL = 30000; // 心跳间隔时间，单位：毫秒

class WebSocketManager {
  private clients: Map<string, Client> = new Map();
  private retryCountMap: Map<string, number> = new Map();
  private subscriptions: Map<string, ((message: string) => void)[]> = new Map();
  constructor() {}

  public getWebSocketClient(
    url: string,
    onMessage: (message: string) => void,
    onError?: (error: any) => void
  ): Client {
    if (this.clients.has(url)) {
      // 如果连接已存在，添加新的订阅回调
      this.subscriptions.get(url)?.push(onMessage);
      return this.clients.get(url)!;
    } else {
      const client = this.createClient(url, onMessage, onError);
      this.clients.set(url, client);
      this.subscriptions.set(url, [onMessage]);
      return client;
    }
  }

  /**
   * 创建 WebSocket 客户端
   * @param url WebSocket订阅地址
   * @param onMessage 收到消息时的回调
   * @param onError 出现错误时的回调
   * @private
   */
  private createClient(
    url: string,
    onMessage: (message: string) => void,
    onError?: (error: any) => void
  ): Client {
    const token = localStorage.getItem(TOKEN_KEY) || "";
    const client = new Client({
      brokerURL: import.meta.env.VITE_APP_WS_ENDPOINT,
      connectHeaders: {
        Authorization: token,
      },
      heartbeatIncoming: HEARTBEAT_INTERVAL,
      heartbeatOutgoing: HEARTBEAT_INTERVAL,
      onConnect: () => {
        console.log(`Connected to ${url}`);
        client.subscribe(url, (message) => {
          onMessage(message.body);
        });
      },
      onStompError: (frame) => {
        console.error(`Error on ${url}: ${frame.headers["message"]}`);
        console.error(`Details: ${frame.body}`);
        if (onError) {
          onError(frame);
        }
        this.handleReconnect(url);
      },
      onDisconnect: () => {
        console.log(`连接失败 ${url}`);
        this.handleReconnect(url);
      },
    });

    client.activate();
    return client;
  }

  /**
   * 处理重连
   * @param url WebSocket订阅地址
   */
  private handleReconnect(url: string) {
    const retryCount = this.retryCountMap.get(url) || 0;

    if (retryCount < MAX_RETRIES) {
      this.retryCountMap.set(url, retryCount + 1);
      console.log(`重试连接 ${url} (${retryCount + 1}/${MAX_RETRIES})...`);
      setTimeout(
        () =>
          this.getWebSocketClient(
            url,
            () => {},
            () => {}
          ),
        RETRY_DELAY_MS
      );
    } else {
      console.error(`已经达到最大重试次数 ${url}`);
      this.retryCountMap.delete(url);
    }
  }

  /**
   * 断开所有 WebSocket 连接
   */
  public disconnectAll() {
    this.clients.forEach((client, url) => {
      console.log(`断开连接: ${url}`);
      client.deactivate();
    });
    this.clients.clear();
    this.retryCountMap.clear();
  }
}

export default new WebSocketManager();
