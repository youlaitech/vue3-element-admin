<template>
  <el-alert :closable="false" title="二级菜单内容片段" type="success" />
  <el-input v-model="value" placeholder="缓存测试" />
</template>
<script setup lang="ts">
defineOptions({ name: "LevelTwoPanel" });

const value = ref("");
</script>
