<!-- 状态圆点：启用为成功色，停用为占位色 -->
<template>
  <span class="status-dot" :class="{ 'is-stopped': !active }" />
</template>

<script setup lang="ts">
defineOptions({ name: "StatusDot" });

/**
 * 是否处于启用状态
 */
defineProps<{ active: boolean }>();
</script>

<style lang="scss" scoped>
.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  background-color: var(--el-color-success);
  border-radius: 50%;
}

.status-dot.is-stopped {
  background-color: var(--el-text-color-placeholder);
}
</style>
