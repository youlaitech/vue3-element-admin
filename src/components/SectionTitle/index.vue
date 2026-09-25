<template>
  <div class="section-title">
    <span>{{ title }}</span>
    <span v-if="tip" class="section-title__tip">{{ tip }}</span>
  </div>
</template>

<script setup lang="ts">
/**
 * 分区标题
 * 表单中划分区块的小标题：竖线 + 标题，标题右侧可跟说明文字
 */
defineOptions({ name: "SectionTitle" });

defineProps<{
  /** 分区标题 */
  title: string;
  /** 标题右侧说明 */
  tip?: string;
}>();
</script>

<style scoped lang="scss">
.section-title {
  display: flex;
  gap: 6px;
  align-items: center;
  margin: 2px 0 14px;
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);

  &::before {
    flex: none;
    width: 3px;
    height: 12px;
    content: "";
    background: var(--el-color-primary);
    border-radius: 2px;
  }
}

.section-title__tip {
  font-size: 12px;
  font-weight: 400;
  color: var(--el-text-color-secondary);
}
</style>
