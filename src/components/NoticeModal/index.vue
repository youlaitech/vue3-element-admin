<template>
  <el-dialog
    v-model="visible"
    :show-close="false"
    append-to-body
    :fullscreen="fullscreen"
    style="z-index: revert"
  >
    <template #header="{ close }">
      <div class="my-header">
        <h3>{{ message.title }}</h3>
        <div class="icon-content">
          <el-icon
            class="icon"
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
      {{ message.noticeTypeLabel }} 优先级 {{ message.priority }} 发布人：{{
        message.releaseBy
      }}
      发布时间：{{ message.releaseTime }}
    </div>
    <el-divider />
    <div
      v-html="message.content"
      style="width: auto; min-height: 400px; text-align: left"
    ></div>
  </el-dialog>
</template>
<script setup lang="ts">
/**
 * 这里可能存在一个问题，因为上面展示方式我是用了v-html，所以这里可能会有xss攻击，后续可以考虑使用其他方式
 * 或者是用 npm install dompurify 来处理
 * 示例代码
 * import DOMPurify from 'dompurify';
 * const rawHtmlContent = '<p>Some HTML content</p>'; // 这可能来自不可信的源
 * const safeHtmlContent = DOMPurify.sanitize(rawHtmlContent);
 */
import { ref } from "vue";
import { defineExpose } from "vue";
import NoticeAPI, { NoticeDetailVO } from "@/api/notice";

const message = ref<NoticeDetailVO>({});
const visible = ref(false);
const fullscreen = ref(false);
const open = (id: number, read: boolean) => {
  fullscreen.value = false;
  getNoticeDetail(id, !read);
};

/**
 * 获取消息详情
 * @param id 通知id
 * @param read 是否是阅读，因为存在管理员查看通知管理中的消息，所以这里需要区分
 */
function getNoticeDetail(id: number, read: boolean) {
  if (read) {
    NoticeAPI.readNotice(id).then((res) => {
      visible.value = true;
      message.value = res;
    });
  } else {
    NoticeAPI.getDetail(id).then((res) => {
      visible.value = true;
      message.value = res;
    });
  }
}
defineExpose({ open });
</script>
<style scoped>
.my-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.my-header .icon-content {
  display: flex;
  gap: 20px;
  justify-content: right;
}

.icon {
  cursor: pointer;
}
</style>
