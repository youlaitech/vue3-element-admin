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
// ❌ 踩坑：页面文件名 icon-select.vue 与模板标签 <icon-select> 同名会触发 Vue 隐式自引用
// （unplugin-vue-components 对同名组件禁用自动导入，运行时解析到页面自身 → 无限递归栈溢出白屏）
// ✅ 显式导入公共组件，优先级高于隐式自引用，杜绝递归
import IconSelect from "@/components/IconSelect/index.vue";

// element-plus 图标格式以el-icon-开头
const iconName = ref("el-icon-edit");
// 本地SVG图标格式为src/assets/icons 下的文件名，不需要svg后缀
// const iconName = ref("api");
</script>
