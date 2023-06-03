<!-- websocket 示例 -->
<script setup lang="ts">
import { sendToAll, sendToUser } from "@/api/websocket";

const inputVal = ref("初始内容");

const topicMsgs = ref<string[]>(["接收到一条主题消息"]); // 主题消息列表
const p2pMsgs = ref<string[]>(["接收到一条点对线消息"]); // 点对点消息列表

import { useUserStore } from "@/store/modules/user";

const userId = useUserStore().userId;

import { useWebSocket } from "@vueuse/core";

const { data, status, close, send, open } = useWebSocket(
  "ws://localhost:8989/ws",
  {
    onConnected(ws) {
      console.log("订阅主题");
      // 连接建立后发送订阅消息
      ws.send(JSON.stringify({ type: "subscribe", topic: "/topic/all" }));
    },
    onMessage(ws, event) {
      // 获取接收到的消息内容
      const message = event.data;

      // 处理消息内容
      console.log("Received message:", message);
    },
  }
);

// 监听 WebSocket 连接状态变化
watch(status, (newStatus) => {
  if (newStatus === "OPEN") {
    // 连接已打开，订阅主题
    console.log(" 连接已打开，订阅主题");
    const subscribeMessage = {
      type: "subscribe",
      channel: "/topic/all",
    };
    send(JSON.stringify(subscribeMessage));
  } else if (newStatus === "CLOSED") {
    // 连接已关闭，执行相应的清理操作
    // ...
  }
});

// 监听 WebSocket 接收到的消息
watch(data, (newData) => {
  console.log("Received data:", newData);

  // 解析消息体
  const message = JSON.parse(newData);

  // 判断消息主题并处理
  if (message.topic === "topic1") {
    // 处理来自 topic1 的消息
    console.log("Received message from topic1:", message);
  } else if (message.topic === "topic2") {
    // 处理来自 topic2 的消息
    console.log("Received message from topic2:", message);
  }
  // 可以根据需要添加更多的判断逻辑来处理其他主题的消息
});

function handleSendToAll() {
  sendToAll(inputVal.value);
}

function handleSendToUser() {
  sendToUser(userId, inputVal.value);
}
onMounted(() => {});
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

    <div>
      <div class="search">
        <el-form :inline="true">
          <el-form-item> <el-input v-model="inputVal" /></el-form-item>
          <el-form-item
            ><el-button @click="handleSendToUser">发送点对点消息</el-button>
            <el-button @click="handleSendToAll">发送广播消息</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-card>
            <template #header>点对点消息接收 </template>
            <div v-for="(msg, index) in p2pMsgs" :key="index">
              {{ msg }}
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card>
            <template #header> 广播消息接收 </template>
            <div v-for="(msg, index) in topicMsgs" :key="index">
              {{ msg }}
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>
