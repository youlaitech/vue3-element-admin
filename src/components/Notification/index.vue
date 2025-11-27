<template>
  <el-dropdown trigger="click">
    <el-badge v-if="noticeList.length > 0" :value="noticeList.length" :max="99">
      <div class="i-svg:bell" />
    </el-badge>

    <div v-else class="i-svg:bell" />

    <template #dropdown>
      <div class="p-5">
        <template v-if="noticeList.length > 0">
          <div v-for="(item, index) in noticeList" :key="index" class="w-500px py-3">
            <div class="flex-y-center">
              <DictLabel v-model="item.type" code="notice_type" size="small" />
              <el-text
                size="small"
                class="w-200px cursor-pointer !ml-2 !flex-1"
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
          <el-divider />
          <div class="flex-x-between">
            <el-link type="primary" underline="never" @click="handleViewMoreNotice">
              <span class="text-xs">查看更多</span>
              <el-icon class="text-xs">
                <ArrowRight />
              </el-icon>
            </el-link>
            <el-link
              v-if="noticeList.length > 0"
              type="primary"
              underline="never"
              @click="handleMarkAllAsRead"
            >
              <span class="text-xs">全部已读</span>
            </el-link>
          </div>
        </template>
        <template v-else>
          <div class="flex-center h-150px w-350px">
            <el-empty :image-size="50" description="暂无消息" />
          </div>
        </template>
      </div>
    </template>
  </el-dropdown>

  <el-dialog
    v-model="noticeDialogVisible"
    :title="noticeDetail?.title ?? '通知详情'"
    width="800px"
    custom-class="notification-detail"
  >
    <div v-if="noticeDetail" class="p-x-20px">
      <div class="flex-y-center mb-16px text-13px text-color-secondary">
        <span class="flex-y-center">
          <el-icon><User /></el-icon>
          {{ noticeDetail.publisherName }}
        </span>
        <span class="ml-2 flex-y-center">
          <el-icon><Timer /></el-icon>
          {{ noticeDetail.publishTime }}
        </span>
      </div>

      <div class="max-h-60vh pt-16px mb-24px overflow-y-auto border-t border-solid border-color">
        <div v-html="noticeDetail.content"></div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { useNotificationCenter } from "@/composables/notice/useNotificationCenter";

const {
  noticeList,
  noticeDialogVisible,
  noticeDetail,
  fetchMyNotices,
  readNotice,
  markAllAsRead,
  viewMore,
} = useNotificationCenter();

function handleReadNotice(id: string) {
  readNotice(id);
}

function handleViewMoreNotice() {
  viewMore();
}

function handleMarkAllAsRead() {
  markAllAsRead();
}

onMounted(() => {
  fetchMyNotices();
});
</script>

<style lang="scss" scoped></style>
