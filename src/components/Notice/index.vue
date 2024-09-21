<template>
  <div class="nav-action-item" style="display: flex; justify-content: center">
    <el-dropdown trigger="hover">
      <el-badge :is-dot="messages.length > 0" :offset="offset">
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
              <template v-if="messages.length > 0">
                <div
                  class="w-[380px] py-2"
                  v-for="(item, index) in messages"
                  :key="index"
                >
                  <el-link type="primary" @click="readNotice(item.id)">
                    <el-badge is-dot />
                    <el-text class="w-350px" size="default" truncated>
                      {{ item.title }}
                    </el-text>
                  </el-link>
                </div>
              </template>
              <template v-else>
                <div class="flex-center h-150px w-350px">
                  <el-text class="w-350px" size="default" truncated>
                    <el-empty :image-size="30" description="暂无消息" />
                  </el-text>
                </div>
              </template>
            </el-tab-pane>
          </el-tabs>
          <el-divider />
          <div class="flex-x-between">
            <el-link type="primary" :underline="false" @click="more">
              <span class="text-xs">查看更多</span>
              <el-icon class="text-xs">
                <ArrowRight />
              </el-icon>
            </el-link>
            <el-link
              v-if="messages.length > 0"
              type="primary"
              :underline="false"
              @click="readAllNotice()"
            >
              <span class="text-xs">全部已读</span>
            </el-link>
          </div>
        </div>
      </template>
    </el-dropdown>
    <NoticeModal ref="noticeModalRef" />
  </div>
</template>
<script setup lang="ts">
import { MessageTypeEnum, MessageTypeLabels } from "@/enums/MessageTypeEnum";
import NoticeAPI from "@/api/notice";
import socket from "@/api/socket";
import NoticeModal from "@/components/NoticeModal/index.vue";
import router from "@/router";

const activeTab = ref(MessageTypeEnum.MESSAGE);
const messages = ref<any>([]);
const noticeModalRef = ref(NoticeModal);
const offset = ref<Number[]>([-15, 15]);

const getFilteredMessages = (type: MessageTypeEnum) => {
  return messages.value.filter(
    (message: { type: MessageTypeEnum }) => message.type === type
  );
};

/**'
 * 连接WebSocket
 */
function connectWebSocket() {
  socket.getWebSocketClient("/user/queue/message", (message) => {
    // 这里是不是可以获取到消息之后，直接调用接口获取消息列表呢？？？
    let parse = JSON.parse(message);
    // 如果是消息类型
    if (parse.noticeType === MessageTypeEnum.MESSAGE) {
      let content = JSON.parse(parse.content);
      //是发布消息
      if (content.type === "release") {
        //获取到id
        let id = content.id;
        //确认messages里面是否有这个id
        let index = messages.value.findIndex((item: any) => item.id === id);
        if (index < 0) {
          let messageContent = {
            id: id,
            title: content.title,
            type: MessageTypeEnum.MESSAGE,
          };
          messages.value.unshift(messageContent);
        }
      }
    }
  });
}

/**
 * 获取消息列表
 * @returns
 */
function listNotice() {
  NoticeAPI.listUnreadNotice().then((res) => {
    messages.value = res;
  });
}

/**
 * 阅读通知公告
 * @param id
 */
function readNotice(id: number) {
  let index = messages.value.findIndex(
    (item: { id: number }) => item.id === id
  );
  if (index >= 0) {
    messages.value.splice(index, 1);
  }
  noticeModalRef.value?.open(id); // 调用 open 方法，传入 ID
}

/**
 * 查看更多
 */
function more() {
  //跳转到我的消息页面
  router.push({ path: "/notice/notice" });
}

/**
 * 全部已读
 */
function readAllNotice() {
  NoticeAPI.readAllNotice().then(() => {
    messages.value = [];
  });
}

onMounted(() => {
  listNotice();
  connectWebSocket();
});
</script>
