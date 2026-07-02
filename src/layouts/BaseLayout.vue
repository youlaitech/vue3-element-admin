<template>
  <div class="layout-root" :class="layoutClass">
    <div
      v-if="showOverlay && isMobile && isSidebarOpen"
      class="layout-root__overlay"
      @click="closeSidebar"
    />

    <slot />
  </div>
</template>

<script setup lang="ts">
import { useLayout } from "./composables/useLayout";

withDefaults(
  defineProps<{
    /** 移动端展开侧边栏时是否显示遮罩层（LeftLayout 需要，MixLayout 不需要） */
    showOverlay?: boolean;
  }>(),
  {
    showOverlay: true,
  }
);

const { layoutClass, isSidebarOpen, isMobile, closeSidebar } = useLayout();
</script>

<style lang="scss" scoped>
.layout-root {
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
