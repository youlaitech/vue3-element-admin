<template>
  <!-- 菜单图标 -->
  <template v-if="icon">
    <el-icon v-if="isElIcon" class="menu-icon">
      <component :is="iconComponent" />
    </el-icon>
    <div v-else :class="`i-svg:${icon}`" class="menu-icon" />
  </template>
  <template v-else>
    <div class="i-svg:menu menu-icon" />
  </template>
  <!-- 菜单标题 -->
  <span v-if="title" class="menu-title ml-1">{{ translateRouteTitle(title) }}</span>
</template>

<script setup lang="ts">
import { translateRouteTitle } from "@/utils/i18n";

const props = defineProps<{
  icon?: string;
  title?: string;
}>();

const isElIcon = computed(() => props.icon?.startsWith("el-icon"));
const iconComponent = computed(() => props.icon?.replace("el-icon-", ""));
</script>

<style lang="scss" scoped>
.menu-icon {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  margin-right: 5px;
  font-size: 18px;
  color: currentcolor;
}
</style>
