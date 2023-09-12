<!-- websocket 示例 -->
<script setup lang="ts">
// https://github.com/sockjs/sockjs-client/issues/547  报错 global is not defined 换成下面的引入
import SockJS from "sockjs-client";
import Stomp from "stompjs";

import { useUserStoreHook } from "@/store/modules/user";

const userStore = useUserStoreHook();

const inputVal = ref("初始内容");

const topicMsgs = ref<string[]>(["接收到一条主题消息"]); // 主题消息列表
const p2pMsgs = ref<string[]>(["接收到一条点对线消息"]);

function handleSendToAll() {
  stompClient.send("/app/sendToAll", {}, inputVal.value);
}

function handleSendToUser() {
  stompClient.send("/app/sendToUser/root", {}, inputVal.value);
}

let stompClient: Stomp.Client;

function initWebSocket() {
  let socket = new SockJS("http://localhost:8989/ws");

  stompClient = Stomp.over(socket);

  stompClient.connect({ Authorization: userStore.token }, () => {
    console.log("连接就绪，订阅主题：", "/topic/all");

    stompClient.subscribe("/topic/notice", (res) => {
      console.log("广播消息接收", res);
    });

    stompClient.subscribe("/user/queue/greeting", (res) => {
      console.log("点对点消息接收", res);
    });
  });
}

onMounted(() => {
  initWebSocket();
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

    <div>
      <div class="search-container">
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
