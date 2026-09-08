<template>
  <section class="entry-section" :class="`entry-section--${kind}`">
    <header class="entry-section__header">
      <el-icon :size="16" class="entry-section__icon">
        <Monitor v-if="kind === 'menu'" />
        <Link v-else />
      </el-icon>
      <span class="entry-section__title">{{ title }}</span>
      <span v-if="sub" class="entry-section__sub">{{ sub }}</span>
    </header>
    <slot />
  </section>
</template>

<script setup lang="ts">
import { Link, Monitor } from "@element-plus/icons-vue";

defineOptions({
  name: "FormPublishEntrySection",
});

/** 入口分区卡片（发布向导②③步共用，左侧色条区分内嵌/分享形态） */
defineProps<{
  /** 分区形态：menu 系统内嵌 / share 对外分享 */
  kind: "menu" | "share";
  /** 分区标题 */
  title: string;
  /** 副标题（形态说明或状态） */
  sub?: string;
}>();
</script>

<style lang="scss" scoped>
.entry-section {
  padding: 0 0 4px;
  overflow: hidden;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;

  &--menu {
    border-left: 3px solid var(--el-color-primary);
  }

  &--share {
    border-left: 3px solid var(--el-color-success);
  }

  &__header {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 10px 14px;
    background-color: var(--el-fill-color-light);
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  &__icon {
    color: var(--el-text-color-secondary);
  }

  &--menu &__icon {
    color: var(--el-color-primary);
  }

  &--share &__icon {
    color: var(--el-color-success);
  }

  &__title {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  &__sub {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}
</style>
