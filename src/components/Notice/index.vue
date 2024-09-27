<template>
  <div>
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
            <el-link type="primary" :underline="false" @click="viewMore">
              <span class="text-xs">查看更多</span>
              <el-icon class="text-xs">
                <ArrowRight />
              </el-icon>
            </el-link>
            <el-link
              v-if="messages.length > 0"
              type="primary"
              :underline="false"
              @click="markAllAsRead"
            >
              <span class="text-xs">全部已读</span>
            </el-link>
          </div>
        </div>
      </template>
    </el-dropdown>

    <!-- 弹窗部分 -->
    <el-dialog
      v-model="modalVisible"
      :show-close="false"
      append-to-body
      :fullscreen="fullscreen"
      style="z-index: revert"
    >
      <template #header="{ close }">
        <div class="flex-x-between">
          <h3>{{ currentMessage.title }}</h3>
          <div class="flex-center">
            <el-icon
              class="ml10px"
              @click="
                () => {
                  fullscreen = !fullscreen;
                }
              "
            >
              <FullScreen />
            </el-icon>
            <el-icon @click="close" class="icon">
              <Close />
            </el-icon>
          </div>
        </div>
      </template>

      <div style="width: auto; text-align: left">
        <span class="header-item">
          <el-tag v-if="currentMessage.type === 2" type="warning">
            系统通知
          </el-tag>
          <el-tag v-if="currentMessage.type === 1" type="success">
            通知消息
          </el-tag>
        </span>
        <div v-html="currentMessage.content"></div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { MessageTypeEnum, MessageTypeLabels } from "@/enums/MessageTypeEnum";
import NoticeAPI from "@/api/notice";
import WebSocketManager from "@/utils/socket";
import router from "@/router";

// 状态和引用
const activeTab = ref(MessageTypeEnum.MESSAGE);
const messages = ref<any[]>([]);
const offset = ref<[number, number]>([-15, 15]);
const currentMessage = ref<any>({});
const modalVisible = ref(false);
const fullscreen = ref(false);

// 获取未读消息列表并连接 WebSocket
onMounted(() => {
  NoticeAPI.getUnreadList().then((data) => {
    messages.value = data;
  });

  WebSocketManager.getOrCreateClient("/user/queue/message", (message) => {
    const parsedMessage = JSON.parse(message);
    if (parsedMessage.noticeType === MessageTypeEnum.MESSAGE) {
      const content = JSON.parse(parsedMessage.content);
      if (content.type === "release") {
        const id = content.id;
        if (!messages.value.some((msg) => msg.id === id)) {
          messages.value.unshift({
            id,
            title: content.title,
            type: MessageTypeEnum.MESSAGE,
          });
        }
      }
    }
  });
});

// 阅读通知公告
function readNotice(id: number) {
  const index = messages.value.findIndex((msg) => msg.id === id);
  if (index >= 0) {
    currentMessage.value = messages.value[index];
    modalVisible.value = true;
    messages.value.splice(index, 1); // 从消息列表中移除已读消息
  }
}

// 查看更多
function viewMore() {
  router.push({ path: "/notice/notice" });
}

// 全部已读
function markAllAsRead() {
  NoticeAPI.readAll().then(() => {
    messages.value = [];
  });
}
</script>

<style scoped></style>
