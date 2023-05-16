<!-- wangEditor富文本编辑器示例 -->
<script setup lang="ts">
import Editor from "@/components/WangEditor/index.vue";
const value = ref("初始内容");
</script>

<template>
  <div class="app-container">
    <editor v-model="value" style="height: calc(100vh - 124px)" />
  </div>
</template>
