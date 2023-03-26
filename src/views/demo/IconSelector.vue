<!-- 图标选择器示例 -->
<script setup lang="ts">
const iconName = ref('edit');
</script>

<template>
  <div class="app-container">
    <icon-select v-model="iconName" />
  </div>
</template>
