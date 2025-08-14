<template>
  <div p-5 flex flex-col gap="20px">
    <div>params: {{ route.params }}</div>
    <div>query: {{ route.query }}</div>
    <el-input v-model="value" placeholder="缓存测试" />
  </div>
</template>
<script lang="ts" setup>
defineOptions({
  name: "DemoDetail",
});

const route = useRoute();
console.log(route);

const value = ref("");
</script>
