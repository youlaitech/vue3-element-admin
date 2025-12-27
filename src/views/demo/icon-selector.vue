<!-- 图标选择器示�?-->
<template>
  <div class="app-container">
    <el-link
      href="https://gitee.com/youlaiorg/vue3-element-admin/blob/master/src/views/demo/icon-selector.vue"
      type="primary"
      target="_blank"
      class="mb-10"
    >
      示例源码 请点�?>>>
    </el-link>
    <icon-select v-model="iconName" />
  </div>
</template>

<script setup lang="ts">
// element-plus 图标格式以el-icon-开�?
const iconName = ref("el-icon-edit");
// 本地SVG图标格式�?src/assets/icons 下的文件名，不需要svg后缀
// const iconName = ref("api");
</script>
