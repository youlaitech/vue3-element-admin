<!-- 图标选择器示例 -->
<script setup lang="ts">
const iconName = ref("edit");
</script>

<template>
  <div class="app-container">
    <el-link
      href="https://gitee.com/youlaiorg/vue3-element-admin/blob/master/src/views/demo/icon-selector.vue"
      type="primary"
      target="_blank"
      class="mb-10"
      >示例源码 请点击>>>></el-link
    >
    <icon-select v-model="iconName" />
  </div>
</template>
