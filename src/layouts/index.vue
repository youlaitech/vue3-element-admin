<template>
  <component :is="currentLayoutComponent" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useLayout } from "./composables/useLayout";
import LeftLayout from "./components/LeftLayout/index.vue";
import TopLayout from "./components/TopLayout/index.vue";
import MixLayout from "./components/MixLayout/index.vue";
import { LayoutMode } from "@/enums/settings/layout.enum";

const { currentLayout } = useLayout();

// 根据当前布局模式选择对应的组件
const currentLayoutComponent = computed(() => {
  switch (currentLayout.value) {
    case LayoutMode.TOP:
      return TopLayout;
    case LayoutMode.MIX:
      return MixLayout;
    case LayoutMode.LEFT:
    default:
      return LeftLayout;
  }
});
</script>
