<template>
  <div>
    <el-dropdown class="flex-center h-full align-middle">
      <el-badge v-if="messages.length > 0" :value="messages.length" :max="99">
        <div><i-ep-bell /></div>
      </el-badge>
      <el-badge v-else>
        <i-ep-bell />
      </el-badge>

      <template #dropdown>
        <div class="p-5">
          <template v-if="messages.length > 0">
            <div
              class="w400px flex-x-between py-2"
              v-for="(item, index) in messages"
              :key="index"
            >
              <div>
                <el-tag type="success" size="small">系统通知</el-tag>
                <el-link
                  type="primary"
                  @click="readNotice(item.id)"
                  class="ml-1"
                >
                  {{ item.title }}
                </el-link>
              </div>
              <div>
                {{ item.publishTime }}
              </div>
            </div>
          </template>
          <template v-else>
            <div class="flex-center h150px w350px">
              <el-empty :image-size="30" description="暂无消息" />
            </div>
          </template>
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

    <NoticeDetail ref="noticeDetailRef" />
  </div>
</template>

<script setup lang="ts">
import NoticeAPI, { NoticePageQuery, NoticePageVO } from "@/api/notice";
import WebSocketManager from "@/utils/socket";
import router from "@/router";

const messages = ref<NoticePageVO[]>([]);
const noticeDetailRef = ref();

// 获取未读消息列表并连接 WebSocket
onMounted(() => {
  NoticeAPI.getMyNoticePage({ pageNum: 1, pageSize: 5, isRead: 0 }).then(
    (data) => {
      messages.value = data.list;
    }
  );

  WebSocketManager.subscribeToTopic("/user/queue/message", (message) => {
    console.log("收到消息：", message);
    const data = JSON.parse(message);
    const id = data.id;
    if (!messages.value.some((msg) => msg.id === id)) {
      messages.value.unshift({
        id,
        title: data.title,
      });

      ElNotification({
        title: "您收到一条新的通知消息！",
        message: data.title,
        type: "success",
        position: "bottom-right",
      });
    }
  });
});

// 阅读通知公告
function readNotice(id: string) {
  noticeDetailRef.value.openNotice(id);
  const index = messages.value.findIndex((msg) => msg.id === id);
  if (index >= 0) {
    messages.value.splice(index, 1); // 从消息列表中移除已读消息
  }
}

// 查看更多
function viewMore() {
  router.push({ path: "/myNotice" });
}

// 全部已读
function markAllAsRead() {
  NoticeAPI.readAll().then(() => {
    messages.value = [];
  });
}
</script>

<style lang="scss" scoped></style>
