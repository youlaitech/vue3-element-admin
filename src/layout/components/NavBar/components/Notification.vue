<template>
  <div>
    <el-dropdown class="wh-full">
      <el-badge v-if="notices.length > 0" :offset="[-10, 15]" :value="notices.length" :max="99">
        <el-icon>
          <Bell />
        </el-icon>
      </el-badge>
      <el-badge v-else>
        <el-icon>
          <Bell />
        </el-icon>
      </el-badge>

      <template #dropdown>
        <div class="p-2">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="通知" name="notice">
              <template v-if="notices.length > 0">
                <div v-for="(item, index) in notices" :key="index" class="w500px py-3">
                  <div class="flex-y-center">
                    <DictLabel v-model="item.type" code="notice_type" size="small" />
                    <el-text
                      size="small"
                      class="w200px cursor-pointer !ml-2 !flex-1"
                      truncated
                      @click="handleReadNotice(item.id)"
                    >
                      {{ item.title }}
                    </el-text>

                    <div class="text-xs text-gray">
                      {{ item.publishTime }}
                    </div>
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="flex-center h150px w350px">
                  <el-empty :image-size="50" description="暂无通知" />
                </div>
              </template>
              <el-divider />
              <div class="flex-x-between">
                <el-link type="primary" :underline="false" @click="handleViewMore">
                  <span class="text-xs">查看更多</span>
                  <el-icon class="text-xs">
                    <ArrowRight />
                  </el-icon>
                </el-link>
                <el-link
                  v-if="notices.length > 0"
                  type="primary"
                  :underline="false"
                  @click="markAllAsRead"
                >
                  <span class="text-xs">全部已读</span>
                </el-link>
              </div>
            </el-tab-pane>
            <el-tab-pane label="消息" name="message">
              <template v-if="messages.length > 0">
                <div
                  v-for="(item, index) in messages"
                  :key="index"
                  class="w400px flex-x-between p-1"
                >
                  <div class="flex-y-center">
                    <DictLabel v-model="item.type" code="notice_type" size="small" />
                    <el-link
                      type="primary"
                      class="w200px cursor-pointer !ml-2 !flex-1"
                      @click="handleReadNotice(item.id)"
                    >
                      {{ item.title }}
                    </el-link>

                    <div class="text-xs text-gray-400">
                      {{ item.publishTime }}
                    </div>
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="flex-center h150px w350px">
                  <el-empty :image-size="50" description="暂无消息" />
                </div>
              </template>
              <el-divider />
              <div class="flex-x-between">
                <el-link
                  v-if="tasks.length > 5"
                  type="primary"
                  :underline="false"
                  @click="handleViewMore"
                >
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
            </el-tab-pane>

            <el-tab-pane label="待办" name="task">
              <template v-if="tasks.length > 0">
                <div v-for="(item, index) in tasks" :key="index" class="w500px py-3">
                  <div class="flex-y-center">
                    <DictLabel v-model="item.type" code="notice_type" size="small" />
                    <el-link
                      type="primary"
                      class="w200px cursor-pointer !ml-2 !flex-1"
                      @click="handleReadNotice(item.id)"
                    >
                      {{ item.title }}
                    </el-link>
                    <div class="text-xs text-gray-400">
                      {{ item.publishTime }}
                    </div>
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="flex-center h150px w350px">
                  <el-empty :image-size="50" description="暂无待办" />
                </div>
              </template>
              <el-divider />
              <div class="flex-x-between">
                <el-link
                  v-if="tasks.length > 5"
                  type="primary"
                  :underline="false"
                  @click="handleViewMore"
                >
                  <span class="text-xs">查看更多</span>
                  <el-icon class="text-xs">
                    <ArrowRight />
                  </el-icon>
                </el-link>
                <el-link
                  v-if="tasks.length > 0"
                  type="primary"
                  :underline="false"
                  @click="markAllAsRead"
                >
                  <span class="text-xs">全部已读</span>
                </el-link>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </template>
    </el-dropdown>

    <NoticeDetail ref="noticeDetailRef" />
  </div>
</template>

<script setup lang="ts">
import NoticeAPI, { NoticePageVO } from "@/api/system/notice";
import WebSocketManager from "@/utils/websocket";
import router from "@/router";

const activeTab = ref("notice");
const notices = ref<NoticePageVO[]>([]);
const messages = ref<any[]>([]);
const tasks = ref<any[]>([]);
const noticeDetailRef = ref();

// 获取未读消息列表并连接 WebSocket
onMounted(() => {
  NoticeAPI.getMyNoticePage({ pageNum: 1, pageSize: 5, isRead: 0 }).then((data) => {
    notices.value = data.list;
  });

  WebSocketManager.subscribeToTopic("/user/queue/message", (message) => {
    console.log("收到消息：", message);
    const data = JSON.parse(message);
    const id = data.id;
    if (!notices.value.some((notice) => notice.id == id)) {
      notices.value.unshift({
        id,
        title: data.title,
        type: data.type,
        publishTime: data.publishTime,
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
function handleReadNotice(id: string) {
  noticeDetailRef.value.openNotice(id);
  const index = notices.value.findIndex((notice) => notice.id === id);
  if (index >= 0) {
    notices.value.splice(index, 1); // 从消息列表中移除已读消息
  }
}

// 查看更多
function handleViewMore() {
  router.push({ path: "/myNotice" });
}

// 全部已读
function markAllAsRead() {
  NoticeAPI.readAll().then(() => {
    notices.value = [];
  });
}
</script>

<style lang="scss" scoped>
:deep(.el-badge) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}
</style>
