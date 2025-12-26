<template>
  <div class="layout" :class="layoutClass">
    <!-- 移动端遮罩层 -->
    <div v-if="isMobile && isSidebarOpen" class="layout__overlay" @click="closeSidebar" />

    <!-- 布局内容插槽 -->
    <slot />
  </div>
</template>

<script setup lang="ts">
import { useLayout } from "./useLayout";

const { layoutClass, isSidebarOpen, isMobile, closeSidebar } = useLayout();
</script>

<style lang="scss" scoped>
.layout {
  width: 100%;
  height: 100%;

  &__overlay {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 999;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.3);
  }
}
</style>
