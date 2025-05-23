<template>
  <div :class="{ 'has-logo': showLogo }" class="layout-sidebar">
    <!-- Logo -->
    <SidebarLogo v-if="showLogo" :collapse="isCollapsed" />
    <!-- 主菜单内容 -->
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import SidebarLogo from "./components/SidebarLogo.vue";

defineProps({
  /**
   * 是否显示Logo
   */
  showLogo: {
    type: Boolean,
    default: true,
  },
  /**
   * 是否折叠
   */
  isCollapsed: {
    type: Boolean,
    default: false,
  },
});
</script>

<style lang="scss" scoped>
.layout-sidebar {
  position: relative;
  height: 100%;
  background-color: var(--menu-background);
  transition: width 0.28s;

  &.has-logo {
    .el-scrollbar {
      height: calc(100vh - $navbar-height);
    }
  }

  :deep(.el-menu) {
    border: none;
  }
}
</style>
