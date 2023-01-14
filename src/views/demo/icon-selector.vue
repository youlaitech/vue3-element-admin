<!-- 图标选择器 -->

<script setup lang="ts">
const value = ref('edit');
</script>

<template>
  <div class="app-container">
    <icon-select v-model="value" width="400px" />
  </div>
</template>
