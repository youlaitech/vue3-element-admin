<template>
  <el-icon v-if="icon && icon.includes('el-icon')" class="sub-el-icon" />
  <SvgIcon v-else-if="icon" :icon-class="icon" />
  <span v-if="title" class="ml-1">{{ translateRouteTitle(title) }}</span>
</template>

<script setup lang="ts">
import { translateRouteTitle } from "@/utils/i18n";

defineProps({
  icon: {
    type: String,
    default: "",
  },
  title: {
    type: String,
    default: "",
  },
});
</script>

<style lang="scss" scoped>
.sub-el-icon {
  width: 1em;
  height: 1em;
  color: currentcolor;
}

.hideSidebar {
  .el-sub-menu,
  .el-menu-item {
    .svg-icon {
      margin-left: 20px;
    }
  }
}
</style>
