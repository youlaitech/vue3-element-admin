<template>
  <div class="layout" :class="layoutClass">
    <!-- 移动端遮罩层 -->
    <div v-if="isMobile && isSidebarOpen" class="layout__overlay" @click="closeSidebar" />

    <!-- 布局内容插槽 -->
    <slot></slot>

    <!-- 返回顶部按钮 -->
    <el-backtop target=".app-main">
      <div class="i-svg:backtop w-6 h-6" />
    </el-backtop>
  </div>
</template>

<script setup lang="ts">
import { useLayout } from "../composables/useLayout";
import { useLayoutResponsive } from "../composables/useLayoutResponsive";

// 布局相关
const { layoutClass, isSidebarOpen, closeSidebar } = useLayout();

// 响应式处理
const { isMobile } = useLayoutResponsive();
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
