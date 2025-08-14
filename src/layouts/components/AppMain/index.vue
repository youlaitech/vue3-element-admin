<template>
  <section class="app-main" :style="{ height: appMainHeight }">
    <KeepCache />
  </section>
</template>

<script setup lang="ts">
import { useSettingsStore } from "@/store";
import variables from "@/styles/variables.module.scss";
import KeepCache from "@/components/KeepCache/index.vue";

const appMainHeight = computed(() => {
  if (useSettingsStore().showTagsView) {
    return `calc(100vh - ${variables["navbar-height"]} - ${variables["tags-view-height"]})`;
  } else {
    return `calc(100vh - ${variables["navbar-height"]})`;
  }
});
</script>

<style lang="scss" scoped>
.app-main {
  position: relative;
  overflow-y: auto;
  background-color: var(--el-bg-color-page);

  /* 布局切换动画优化 */
  &.animate__animated {
    animation-duration: 0.4s;
    animation-fill-mode: forwards;
  }

  &.animate__fadeOut {
    animation-timing-function: ease-in;
  }

  &.animate__fadeIn {
    animation-timing-function: ease-out;
  }
}
</style>
