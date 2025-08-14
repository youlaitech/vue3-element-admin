<template>
  <div flex flex-col gap-20px>
    <el-alert :closable="false" title="菜单三级-2" type="warning" />
    <el-input v-model="value" placeholder="缓存测试" />
    <ToDetail />
  </div>
</template>

<script lang="ts" setup>
import ToDetail from "./detail";

defineOptions({ name: "MultiLevel32" });
const value = ref("");
</script>
