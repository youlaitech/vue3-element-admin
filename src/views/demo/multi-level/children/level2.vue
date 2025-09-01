<template>
  <el-alert :closable="false" title="菜单二级" type="success" />
  <el-input v-model="value" placeholder="缓存测试" />
</template>
<script setup lang="ts">
defineOptions({ name: "MultiLevel2" });

const value = ref("");

onMounted(() => {
  console.log("MultiLevel2 mounted");
});
</script>
