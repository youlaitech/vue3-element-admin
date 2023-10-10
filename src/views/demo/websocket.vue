<!-- websocket 示例 -->
<script setup lang="ts">
import SockJS from "sockjs-client";
import Stomp from "stompjs";

import { useUserStoreHook } from "@/store/modules/user";

const userStore = useUserStoreHook();

const isConnected = ref(false);
const socketEndpoint = ref("http://47.117.115.107:8989/ws"); // 线上
// const socketEndpoint = ref("http://localhost:8989/ws"); // 本地

const receiver = ref("root");

interface MessageType {
  type?: string; // 消息类型： tip-提示消息
  sender?: string;
  content: string;
}

const messages = ref<MessageType[]>([]);

const topicMessage = ref(
  "亲爱的大冤种们，由于一只史诗级的BUG，系统版本已经被迫回退到了0.0.1。"
); // 广播消息

const queneMessage = ref(
  "hi , " +
    receiver.value +
    " , 我是" +
    userStore.user.username +
    " , 想和你交个朋友 ! "
);

function sendToAll() {
  stompClient.send("/app/sendToAll", {}, topicMessage.value);
  messages.value.push({
    sender: userStore.user.username,
    content: topicMessage.value,
  });
}

function sendToUser() {
  stompClient.send("/app/sendToUser/" + receiver.value, {}, queneMessage.value);
  messages.value.push({
    sender: userStore.user.username,
    content: queneMessage.value,
  });
}

let stompClient: Stomp.Client;

function connectWebSocket() {
  let socket = new SockJS(socketEndpoint.value);

  stompClient = Stomp.over(socket);

  stompClient.connect(
    { Authorization: userStore.token },
    () => {
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

      stompClient.subscribe("/user/queue/greeting", (res) => {
        const messageData = JSON.parse(res.body) as MessageType;
        messages.value.push({
          sender: messageData.sender,
          content: messageData.content,
        });
      });
    },
    (error) => {
      console.log("连接失败: " + error);
      isConnected.value = false; // 更新连接状态
      messages.value.push({
        sender: "Server",
        content: "Websocket 已断开",
        type: "tip",
      });
    }
  );
}

function disconnectWebSocket() {
  if (stompClient && stompClient.connected) {
    stompClient.disconnect(() => {
      isConnected.value = false; // 更新连接状态
      messages.value.push({
        sender: "Server",
        content: "Websocket 已断开",
        type: "tip",
      });
    });
  }
}

onMounted(() => {
  connectWebSocket();
});
</script>

<template>
  <div class="app-container">
    <el-link
      href="https://gitee.com/youlaiorg/vue3-element-admin/blob/master/src/views/demo/websocket.vue"
      type="primary"
      target="_blank"
      class="mb-[20px]"
      >示例源码 请点击>>>></el-link
    >
    <el-row :gutter="10">
      <el-col :span="12">
        <el-card>
          <el-row>
            <el-col :span="16">
              <el-input v-model="socketEndpoint" class="w-220px" />
              <el-button
                type="primary"
                class="ml-5"
                @click="connectWebSocket"
                :disabled="isConnected"
                >连接</el-button
              >
              <el-button
                type="danger"
                @click="disconnectWebSocket"
                :disabled="!isConnected"
                >断开</el-button
              >
            </el-col>

            <el-col :span="8" class="text-right">
              连接状态：
              <el-tag class="ml-2" type="success" v-if="isConnected"
                >已连接</el-tag
              >
              <el-tag class="ml-2" type="info" v-else>已断开</el-tag>
            </el-col>
          </el-row>
        </el-card>

        <el-card class="mt-5">
          <el-form label-width="90px">
            <el-form-item label="消息内容">
              <el-input type="textarea" v-model="topicMessage" />
            </el-form-item>

            <el-form-item>
              <el-button @click="sendToAll" type="primary">发送广播</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card class="mt-5">
          <el-form label-width="90px">
            <el-form-item label="消息内容">
              <el-input type="textarea" v-model="queneMessage" />
            </el-form-item>
            <el-form-item label="消息接收人">
              <el-input v-model="receiver" />
            </el-form-item>
            <el-form-item>
              <el-button @click="sendToUser" type="primary"
                >发送点对点消息</el-button
              >
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <div class="message-container">
            <div
              v-for="(message, index) in messages"
              :key="index"
              :class="{
                'tip-message': message.type === 'tip',
                message: message.type !== 'tip',
                'message--sent': message.sender === userStore.user.username,
                'message--received': message.sender !== userStore.user.username,
              }"
            >
              <div v-if="message.type != 'tip'" class="message-content">
                <div
                  :class="{
                    'message-sender':
                      message.sender === userStore.user.username,
                    'message-receiver':
                      message.sender !== userStore.user.username,
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
