<template>
  <el-dialog v-model="visible" width="720px" align-center>
    <template #header>
      <div v-if="detail" class="notice-dialog__head">
        <DictTag :model-value="detail.type" code="notice_type" size="small" />
        <h3 class="notice-dialog__title">{{ detail.title }}</h3>
      </div>
      <div v-if="detail" class="notice-dialog__meta">
        <span class="notice-dialog__meta-item">
          <el-icon><User /></el-icon>
          {{ detail.publisherName }}
        </span>
        <span class="notice-dialog__meta-item">
          <el-icon><Timer /></el-icon>
          {{ detail.publishTime }}
        </span>
      </div>
    </template>

    <!-- 富文本仅在显示边界清洗，存储内容仍由服务端负责校验。 -->
    <div v-if="contentHtml" class="notice-dialog__content" v-html="contentHtml" />
    <el-empty v-else :image-size="60" description="暂无内容" />
  </el-dialog>
</template>

<script setup lang="ts">
import type { NoticeDetail } from "@/api/system/notice";
import DOMPurify from "dompurify";

defineOptions({
  name: "NoticeDetailDialog",
});

/**
 * 通知详情弹窗
 */
const props = defineProps<{
  /** 通知详情数据 */
  detail?: NoticeDetail | null;
}>();

const contentHtml = computed(() =>
  DOMPurify.sanitize(props.detail?.content ?? "", { USE_PROFILES: { html: true } })
);

const visible = defineModel<boolean>({ default: false });
</script>

<style lang="scss" scoped>
.notice-dialog {
  &__head {
    display: flex;
    gap: 8px;
    align-items: center;
    padding-right: 40px;
  }

  &__title {
    min-width: 0;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 16px;
    font-weight: 600;
    line-height: 1.5;
    color: var(--el-text-color-primary);
    white-space: nowrap;
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: center;
    margin-top: 8px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  &__meta-item {
    display: inline-flex;
    gap: 4px;
    align-items: center;
  }

  &__content {
    max-height: 56vh;
    padding: 16px 18px;
    overflow-y: auto;
    background: var(--el-fill-color-extra-light);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
  }
}
</style>
