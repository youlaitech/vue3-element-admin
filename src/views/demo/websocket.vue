<!-- websocket 示例 -->
<script setup lang="ts">
// https://github.com/sockjs/sockjs-client/issues/547  报错 global is not defined 换成下面的引入
import SockJS from "sockjs-client";
import Stomp from "stompjs";

import { useUserStoreHook } from "@/store/modules/user";

const userStore = useUserStoreHook();

const isConnected = ref(false);
const socketEndpoint = ref("http://localhost:8989/ws");

const receiverUsername = ref("root");

const topicMessages = ref<string[]>([]); // 广播消息集合
const queneMessages = ref<string[]>([]); // 点对点消息集合

const topicMessage = ref(
  "亲爱的大冤种们，由于一只史诗级的BUG，系统版本已经被迫回退到了0.0.1。"
); // 广播消息
const queneMessage = computed(() => {
  return (
    "hi , " +
    receiverUsername.value +
    " , 我是" +
    userStore.user.username +
    " , 想和你交个朋友 ! "
  );
});

function sendNotice() {
  stompClient.send("/app/sendToAll", {}, topicMessage.value);
}

function sendToUser() {
  stompClient.send(
    "/app/sendToUser/" + receiverUsername.value,
    {},
    queneMessage.value
  );
  topicMessages.value.push(queneMessage.value);
}

let stompClient: Stomp.Client;

function connectWebSocket() {
  let socket = new SockJS(socketEndpoint.value);

  stompClient = Stomp.over(socket);

  stompClient.connect(
    { Authorization: userStore.token },
    () => {
      isConnected.value = true;
      stompClient.subscribe("/topic/notice", (res) => {
        console.log("广播消息接收", res);
      });

      stompClient.subscribe("/user/queue/greeting", (res) => {
        console.log("点对点消息接收", res);
      });
    },
    (error) => {
      // 连接断开时触发此回调函数
      console.error("WebSocket 连接断开", error);
      // 在此可以执行一些处理断开连接的逻辑
      isConnected.value = false; // 更新连接状态
    }
  );
}

function disconnectWebSocket() {
  if (stompClient && stompClient.connected) {
    stompClient.disconnect(() => {
      // 在这里执行断开连接后的操作
      isConnected.value = false; // 更新连接状态
    });
  }
}

const messages = ref([
  { id: 1, sender: "me", text: "你好，这是我发送的消息。" },
  { id: 2, sender: "Server", text: "嗨，我收到了你的消息。" },
  { id: 3, sender: "me", text: "很高兴和你聊天！" },
  { id: 4, sender: "Server", text: "我也很高兴和你聊天！" },
  { id: 5, sender: "me", text: "😅💤" },
  {
    id: 6,
    sender: "Server",
    text: "亲爱的大冤种们，由于一只史诗级的BUG，系统版本已经被迫回退到了0.0.1。",
  },
]);

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
              <el-input v-model="socketEndpoint" class="w-200px" />
              <el-button type="primary" class="ml-5" @click="connectWebSocket"
                >连接</el-button
              >
              <el-button type="danger" @click="disconnectWebSocket"
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
              <el-button @click="sendNotice" type="primary">发送广播</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card class="mt-5">
          <el-form label-width="90px">
            <el-form-item label="消息内容">
              <el-input type="textarea" v-model="queneMessage" />
            </el-form-item>
            <el-form-item label="消息接收人">
              <el-input v-model="receiverUsername" />
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
            <div class="system-notification">dafsdfads</div>

            <div
              v-for="message in messages"
              :key="message.id"
              class="message-item"
              :class="{
                'message-item--sent': message.sender === 'me',
                'message-item--received': message.sender !== 'me',
              }"
            >
              <div class="message-content">
                <div
                  :class="{
                    'message-sender': message.sender === 'me',
                    'message-receiver': message.sender !== 'me',
                  }"
                >
                  {{ message.sender }}
                </div>
                <div class="message-text">{{ message.text }}</div>
              </div>
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

.message-item {
  padding: 10px;
  margin: 10px;
  border-radius: 5px;
}

.message-item--sent {
  align-self: flex-end;
  background-color: #dcf8c6;
}

.message-item--received {
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

.message-text {
  color: #333;
}

.system-notification {
  padding: 5px;
  font-style: italic;
  text-align: center;
  background-color: #f0f0f0;
  border-radius: 5px;
}
</style>
