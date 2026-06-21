<template>
  <div class="layout-root" :class="layoutClass">
    <div v-if="isMobile && isSidebarOpen" class="layout-root__overlay" @click="closeSidebar" />

    <slot />
  </div>
</template>

<script setup lang="ts">
import { useLayout } from "./composables/useLayout";

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
