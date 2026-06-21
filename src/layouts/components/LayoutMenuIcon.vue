<template>
  <el-icon v-if="isElementIcon" class="layout-menu-icon layout-menu-icon--element menu-icon">
    <component :is="elementIconName" />
  </el-icon>
  <div v-else :class="['layout-menu-icon', 'layout-menu-icon--svg', 'menu-icon', svgIconClass]" />
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    icon?: string;
  }>(),
  {
    icon: "",
  }
);

const isElementIcon = computed(() => props.icon.startsWith("el-icon"));
const elementIconName = computed(() => props.icon.replace("el-icon-", ""));
const svgIconClass = computed(() => `i-svg:${props.icon || "menu"}`);
</script>
