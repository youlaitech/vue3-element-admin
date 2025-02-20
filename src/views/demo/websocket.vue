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
            <el-col :span="16">
              <el-input v-model="socketEndpoint" class="w-220px" />
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
            <el-col :span="8" class="text-right">
              连接状态：
              <el-tag v-if="isConnected" class="ml-2" type="success">已连接</el-tag>
              <el-tag v-else class="ml-2" type="info">已断开</el-tag>
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
          <div class="message-container">
            <div
              v-for="(message, index) in messages"
              :key="index"
              :class="{
                'tip-message': message.type === 'tip',
                message: message.type !== 'tip',
                'message--sent': message.sender === userStore.userInfo.username,
                'message--received': message.sender !== userStore.userInfo.username,
              }"
            >
              <div v-if="message.type != 'tip'" class="message-content">
                <div
                  :class="{
                    'message-sender': message.sender === userStore.userInfo.username,
                    'message-receiver': message.sender !== userStore.userInfo.username,
                  }"
                >
                  {{ message.sender }}
                </div>
                <div class="color-#333">{{ message.content }}</div>
              </div>
              <div v-else>{{ message.content }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { Client } from "@stomp/stompjs";

import { useUserStoreHook } from "@/store/modules/user";
import { getToken } from "@/utils/auth";

const userStore = useUserStoreHook();
const isConnected = ref(false);
const socketEndpoint = ref(import.meta.env.VITE_APP_WS_ENDPOINT);

const receiver = ref("root");

interface MessageType {
  type?: string;
  sender?: string;
  content: string;
}

const messages = ref<MessageType[]>([]);

const topicMessage = ref("亲爱的大冤种们，由于一只史诗级的BUG，系统版本已经被迫回退到了0.0.1。"); // 广播消息

const queneMessage = ref(
  "hi , " + receiver.value + " , 我是" + userStore.userInfo.username + " , 想和你交个朋友 ! "
);

let stompClient: Client;

function connectWebSocket() {
  stompClient = new Client({
    brokerURL: socketEndpoint.value,
    connectHeaders: {
      Authorization: getToken(),
    },
    debug: (str: any) => {
      console.log(str);
    },
    onConnect: () => {
      console.log("连接成功");
      isConnected.value = true;
      messages.value.push({
        sender: "Server",
        content: "Websocket 已连接",
        type: "tip",
      });

      stompClient.subscribe("/topic/notice", (res: any) => {
        messages.value.push({
          sender: "Server",
          content: res.body,
        });
      });

      stompClient.subscribe("/user/queue/greeting", (res: any) => {
        const messageData = JSON.parse(res.body) as MessageType;
        messages.value.push({
          sender: messageData.sender,
          content: messageData.content,
        });
      });
    },
    onStompError: (frame: any) => {
      console.error("Broker reported error: " + frame.headers["message"]);
      console.error("Additional details: " + frame.body);
    },
    onDisconnect: () => {
      isConnected.value = false;
      messages.value.push({
        sender: "Server",
        content: "Websocket 已断开",
        type: "tip",
      });
    },
  });

  stompClient.activate();
}

function disconnectWebSocket() {
  if (stompClient && stompClient.connected) {
    stompClient.deactivate();
    isConnected.value = false;
    messages.value.push({
      sender: "Server",
      content: "Websocket 已断开",
      type: "tip",
    });
  }
}

function sendToAll() {
  if (stompClient.connected) {
    stompClient.publish({
      destination: "/topic/notice",
      body: topicMessage.value,
    });
    messages.value.push({
      sender: userStore.userInfo.username,
      content: topicMessage.value,
    });
  }
}

function sendToUser() {
  if (stompClient.connected) {
    stompClient.publish({
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
</script>

<style scoped>
.message-container {
  display: flex;
  flex-direction: column;
}

.message {
  padding: 10px;
  margin: 10px;
  border-radius: 5px;
}

.message--sent {
  align-self: flex-end;
  background-color: #dcf8c6;
}

.message--received {
  align-self: flex-start;
  background-color: #e8e8e8;
}

.message-content {
  display: flex;
  flex-direction: column;
}

.message-sender {
  margin-bottom: 5px;
  font-weight: bold;
  text-align: right;
}

.message-receiver {
  margin-bottom: 5px;
  font-weight: bold;
  text-align: left;
}

.tip-message {
  align-self: center;
  padding: 5px 10px;
  margin-bottom: 5px;
  font-style: italic;
  text-align: center;
  background-color: #f0f0f0;
  border-radius: 5px;
}
</style>
