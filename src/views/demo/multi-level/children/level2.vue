<template>
  <div flex flex-col gap-20px>
    <el-alert :closable="false" title="菜单二级" type="success" />
    <KeepCache />
  </div>
</template>
<script setup lang="ts">
import KeepCache from "@/components/KeepCache/index.vue";
defineOptions({ name: "MultiLevel2" });
</script>
