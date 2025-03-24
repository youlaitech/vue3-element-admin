<template>
  <div class="app-container">
    <el-link
      href="https://gitee.com/youlaiorg/vue3-element-admin/blob/master/src/views/demo/websocket.vue"
      type="primary"
      target="_blank"
      class="mb-[20px]"
    >
      示例源码 请点击>>>>
    </el-link>
    <el-row :gutter="10">
      <el-col :span="12">
        <el-card>
          <el-row>
            <el-col :span="18">
              <el-input v-model="socketEndpoint" style="width: 200px" />
              <el-button
                type="primary"
                class="ml-5"
                :disabled="isConnected"
                @click="connectWebSocket"
              >
                连接
              </el-button>
              <el-button type="danger" :disabled="!isConnected" @click="disconnectWebSocket">
                断开
              </el-button>
            </el-col>
            <el-col :span="6" class="text-right">
              连接状态：
              <el-tag v-if="isConnected" type="success">已连接</el-tag>
              <el-tag v-else type="info">已断开</el-tag>
            </el-col>
          </el-row>
        </el-card>
        <!-- 广播消息发送部分 -->
        <el-card class="mt-5">
          <el-form label-width="90px">
            <el-form-item label="消息内容">
              <el-input v-model="topicMessage" type="textarea" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="sendToAll">发送广播</el-button>
            </el-form-item>
          </el-form>
        </el-card>
        <!-- 点对点消息发送部分 -->
        <el-card class="mt-5">
          <el-form label-width="90px">
            <el-form-item label="消息内容">
              <el-input v-model="queneMessage" type="textarea" />
            </el-form-item>
            <el-form-item label="消息接收人">
              <el-input v-model="receiver" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="sendToUser">发送点对点消息</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      <!-- 消息接收显示部分 -->
      <el-col :span="12">
        <el-card>
          <div class="chat-messages-wrapper">
            <div
              v-for="(message, index) in messages"
              :key="index"
              :class="[
                message.type === 'tip' ? 'system-notice' : 'chat-message',
                {
                  'chat-message--sent': message.sender === userStore.userInfo.username,
                  'chat-message--received': message.sender !== userStore.userInfo.username,
                },
              ]"
            >
              <template v-if="message.type != 'tip'">
                <div class="chat-message__content">
                  <div
                    :class="{
                      'chat-message__sender': message.sender === userStore.userInfo.username,
                      'chat-message__receiver': message.sender !== userStore.userInfo.username,
                    }"
                  >
                    {{ message.sender }}
                  </div>
                  <div class="text-gray-600">{{ message.content }}</div>
                </div>
              </template>
              <div v-else>{{ message.content }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { useStomp } from "@/hooks/useStomp";
import { useUserStoreHook } from "@/store/modules/user.store";

const userStore = useUserStoreHook();
// 用于手动调整 WebSocket 地址
const socketEndpoint = ref(import.meta.env.VITE_APP_WS_ENDPOINT);
// 同步连接状态
interface MessageType {
  type?: string;
  sender?: string;
  content: string;
}
const messages = ref<MessageType[]>([]);
// 广播消息内容
const topicMessage = ref("亲爱的朋友们，系统已恢复最新状态。");
// 点对点消息内容（默认示例）
const queneMessage = ref("Hi, " + userStore.userInfo.username + " 这里是点对点消息示例！");
const receiver = ref("root");

// 调用 useStomp hook，默认使用 socketEndpoint 和 token（此处用 getAccessToken()）
const { isConnected, connect, subscribe, disconnect, client } = useStomp({
  debug: true,
});

watch(
  () => isConnected.value,
  (connected) => {
    if (connected) {
      // 连接成功后，订阅广播和点对点消息主题
      subscribe("/topic/notice", (res) => {
        messages.value.push({
          sender: "Server",
          content: res.body,
        });
      });
      subscribe("/user/queue/greeting", (res) => {
        const messageData = JSON.parse(res.body) as MessageType;
        messages.value.push({
          sender: messageData.sender,
          content: messageData.content,
        });
      });
      messages.value.push({
        sender: "Server",
        content: "Websocket 已连接",
        type: "tip",
      });
    } else {
      messages.value.push({
        sender: "Server",
        content: "Websocket 已断开",
        type: "tip",
      });
    }
  }
);

// 连接 WebSocket
function connectWebSocket() {
  connect();
}

// 断开 WebSocket
function disconnectWebSocket() {
  disconnect();
}

// 发送广播消息
function sendToAll() {
  if (client.value && client.value.connected) {
    client.value.publish({
      destination: "/topic/notice",
      body: topicMessage.value,
    });
    messages.value.push({
      sender: userStore.userInfo.username,
      content: topicMessage.value,
    });
  }
}

// 发送点对点消息
function sendToUser() {
  if (client.value && client.value.connected) {
    client.value.publish({
      destination: "/app/sendToUser/" + receiver.value,
      body: queneMessage.value,
    });
    messages.value.push({
      sender: userStore.userInfo.username,
      content: queneMessage.value,
    });
  }
}

onMounted(() => {
  connectWebSocket();
});

onBeforeUnmount(() => {
  disconnectWebSocket();
});
</script>

<style scoped lang="scss">
.chat-messages-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.chat-message {
  max-width: 80%;
  padding: 10px;
  border-radius: 5px;
  &--sent {
    align-self: flex-end;
    background-color: #dcf8c6;
  }
  &--received {
    align-self: flex-start;
    background-color: #e8e8e8;
  }
  &__content {
    display: flex;
    flex-direction: column;
    color: var(--el-text-color-primary); // 使用主题文本颜色
  }
  &__sender {
    margin-bottom: 5px;
    font-weight: bold;
    text-align: right;
  }
  &__receiver {
    margin-bottom: 5px;
    font-weight: bold;
    text-align: left;
  }
}
.system-notice {
  align-self: center;
  padding: 5px 10px;
  font-size: 0.9em;
  color: var(--el-text-color-secondary);
  background-color: var(--el-fill-color-lighter);
  border-radius: 15px;
}
</style>
