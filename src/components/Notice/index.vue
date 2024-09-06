<template>
  <el-dropdown class="message nav-action-item" trigger="click">
    <el-badge is-dot>
      <div class="flex-center h100% p10px">
        <i-ep-bell />
      </div>
    </el-badge>
    <template #dropdown>
      <div class="px-5 py-2">
        <el-tabs v-model="activeTab">
          <el-tab-pane
            v-for="(label, key) in MessageTypeLabels"
            :label="label"
            :name="key"
            :key="key"
          >
            <div
              class="w-[380px] py-2"
              v-for="message in getFilteredMessages(key)"
              :key="message.id"
            >
              <el-link type="primary">
                <el-text class="w-350px" size="default" truncated>
                  {{ message.title }}
                </el-text>
              </el-link>
            </div>
          </el-tab-pane>
        </el-tabs>
        <el-divider />
        <div class="flex-x-between">
          <el-link type="primary" :underline="false">
            <span class="text-xs">查看更多</span>
            <el-icon class="text-xs">
              <ArrowRight />
            </el-icon>
          </el-link>
          <el-link type="primary" :underline="false">
            <span class="text-xs">全部已读</span>
          </el-link>
        </div>
      </div>
    </template>
  </el-dropdown>
</template>
<script setup lang="ts">
import { MessageTypeEnum, MessageTypeLabels } from "@/enums/MessageTypeEnum";
import NoticeAPI from "@/api/notice";
import { getWebSocketClient, WebSocketService } from "@/api/socket";
import WebSocketManager from "@/api/WebSocketManager";

const activeTab = ref(MessageTypeEnum.MESSAGE);

const messages = ref([
  {
    id: 1,
    title: "系统升级通知：服务器将于今晚12点进行升级维护，请提前保存工作内容。",
    type: MessageTypeEnum.MESSAGE,
  },
  {
    id: 2,
    title: "新功能发布：我们的应用程序现在支持多语言功能。",
    type: MessageTypeEnum.MESSAGE,
  },
  {
    id: 3,
    title: "重要提醒：请定期更改您的密码以保证账户安全。",
    type: MessageTypeEnum.MESSAGE,
  },
  // {
  //   id: 4,
  //   title: "通知：您有一条未读的系统消息，请及时查看。",
  //   type: MessageTypeEnum.NOTICE,
  // },
  // {
  //   id: 5,
  //   title: "新订单通知：您有一笔新的订单需要处理。",
  //   type: MessageTypeEnum.NOTICE,
  // },
  // {
  //   id: 6,
  //   title: "审核提醒：您的审核请求已被批准。",
  //   type: MessageTypeEnum.NOTICE,
  // },
  // { id: 7, title: "待办事项：完成用户权限设置。", type: MessageTypeEnum.TODO },
  // { id: 8, title: "待办事项：更新产品列表。", type: MessageTypeEnum.TODO },
  // { id: 9, title: "待办事项：备份数据库。", type: MessageTypeEnum.TODO },
]);
const getFilteredMessages = (type: MessageTypeEnum) => {
  return messages.value.filter((message) => message.type === type);
};

function connectWebSocket() {
  WebSocketManager.getWebSocketClient("/user/queue/message", (message) => {
    console.log("收到消息：", message);
  });
}

function listNotice() {
  NoticeAPI.listNotice().then((res) => {});
}

onMounted(() => {
  // listNotice();
  connectWebSocket();
});
</script>
