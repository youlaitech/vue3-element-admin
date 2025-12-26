<template>
  <el-alert :closable="false" title="菜单一" />
</template>
<script setup lang="ts">
defineOptions({ name: "MultiLevel1" });

onMounted(() => {
  console.log("MultiLevel1 mounted");
});
</script>
