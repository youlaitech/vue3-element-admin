<template>
  <component :is="currentLayoutComponent" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useLayout } from "./composables/useLayout";
import LeftSideLayout from "./components/LeftSideLayout/index.vue";
import TopMenuLayout from "./components/TopMenuLayout/index.vue";
import MixMenuLayout from "./components/MixMenuLayout/index.vue";
import { LayoutMode } from "@/enums/settings/layout.enum";

const { currentLayout } = useLayout();

// 根据当前布局模式选择对应的组件
const currentLayoutComponent = computed(() => {
  switch (currentLayout.value) {
    case LayoutMode.TOP:
      return TopMenuLayout;
    case LayoutMode.MIX:
      return MixMenuLayout;
    case LayoutMode.LEFT:
    default:
      return LeftSideLayout;
  }
});
</script>
