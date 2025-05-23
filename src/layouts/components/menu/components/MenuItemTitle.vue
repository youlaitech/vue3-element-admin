<template>
  <!-- 菜单图标 -->
  <template v-if="icon">
    <el-icon v-if="isElIcon" class="el-icon">
      <component :is="iconComponent" />
    </el-icon>
    <div v-else :class="`i-svg:${icon}`" />
  </template>
  <template v-else>
    <div class="i-svg:menu" />
  </template>
  <!-- 菜单标题 -->
  <span v-if="title" class="ml-1">{{ translateRouteTitle(title) }}</span>
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
.el-icon {
  width: 14px !important;
  margin-right: 0 !important;
  color: currentcolor;
}

[class^="i-svg:"] {
  width: 14px;
  height: 14px;
  color: currentcolor !important;
}

.hideSidebar {
  .el-sub-menu,
  .el-menu-item {
    .el-icon {
      margin-left: 20px;
    }
  }

  [class^="i-svg:"] {
    margin-left: 20px;
  }
}
</style>
