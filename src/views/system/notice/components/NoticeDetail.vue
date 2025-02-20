<template>
  <el-dialog
    v-model="visible"
    :show-close="false"
    :fullscreen="isFullscreen"
    width="50%"
    append-to-body
    @close="handleClose"
  >
    <template #header>
      <div class="flex-x-between">
        <span>通知公告详情</span>
        <div class="dialog-toolbar">
          <!-- 全屏/退出全屏按钮 -->
          <el-button circle @click="toggleFullscreen">
            <SvgIcon v-if="isFullscreen" icon-class="fullscreen-exit" />
            <SvgIcon v-else icon-class="fullscreen" />
          </el-button>
          <!-- 关闭按钮 -->
          <el-button circle @click="handleClose">
            <template #icon>
              <Close />
            </template>
          </el-button>
        </div>
      </div>
    </template>

    <el-descriptions :column="1">
      <el-descriptions-item label="标题：">
        {{ notice.title }}
      </el-descriptions-item>
      <el-descriptions-item label="发布状态：">
        <el-tag v-if="notice.publishStatus == 0" type="info">未发布</el-tag>
        <el-tag v-else-if="notice.publishStatus == 1" type="success">已发布</el-tag>
        <el-tag v-else-if="notice.publishStatus == -1" type="warning">已撤回</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="发布人：">
        {{ notice.publisherName }}
      </el-descriptions-item>
      <el-descriptions-item label="发布时间：">
        {{ notice.publishTime }}
      </el-descriptions-item>
      <el-descriptions-item label="公告内容：">
        <div v-html="notice.content" />
      </el-descriptions-item>
    </el-descriptions>
  </el-dialog>
</template>

<script setup lang="ts">
import NoticeAPI, { NoticeDetailVO } from "@/api/system/notice";

const visible = ref(false);
const notice = ref<NoticeDetailVO>({});
const isFullscreen = ref(false); // 控制全屏状态

// 切换全屏
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
};

// 关闭弹窗
const handleClose = () => {
  visible.value = false;
};

// 接收公告详情
const openNotice = async (id: string) => {
  visible.value = true;
  const noticeDetail = await NoticeAPI.getDetail(id);
  notice.value = noticeDetail;
};

defineExpose({
  openNotice,
});
</script>

<style scoped></style>
