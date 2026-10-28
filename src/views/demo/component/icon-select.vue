<!-- 图标选择器示例 -->
<template>
  <div class="page-container">
    <el-button
      class="mb-10"
      tag="a"
      href="https://gitee.com/youlaiorg/vue3-element-admin/blob/master/src/views/demo/component/icon-select.vue"
      target="_blank"
      link
      type="info"
      size="small"
    >
      <el-icon class="mr-1"><Link /></el-icon>
      示例源码
    </el-button>
    <IconSelect v-model="iconName" />
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "DemoIconSelect",
});

// 页面与 <icon-select> 同名会触发隐式自引用，运行时会解析到页面自身并递归，显式导入优先命中公共组件
import IconSelect from "@/components/IconSelect/index.vue";

// element-plus 图标格式以 el-icon-开头
const iconName = ref("el-icon-edit");
// 本地 SVG 图标格式为 src/assets/icons 下的文件名，不需要 svg 后缀
</script>
