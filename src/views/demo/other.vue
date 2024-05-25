<template>
  <div>路由参数：{{ query }}</div>
</template>

<script setup lang="ts">
defineOptions({
  name: "Other",
  inheritAttrs: false,
});
import { useRoute } from "vue-router";

// 获取query参数
const query = useRoute().query.type as string;
</script>

<style lang="scss" scoped></style>
