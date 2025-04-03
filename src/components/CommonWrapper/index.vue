<template>
  <div cursor-pointer flex-center rounded class="el" :class="padding">
    <slot></slot>
  </div>
</template>
<script setup lang="ts">
defineProps({
  padding: {
    type: String,
    default: "p-2",
  },
});
</script>
<style scoped lang="scss">
.el {
  transition: 0.3s var(--el-transition-function-ease-in-out-bezier);
  &:hover {
    background-color: var(--el-fill-color);
  }
}
</style>
