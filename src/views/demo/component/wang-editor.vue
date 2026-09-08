<!-- wangEditor富文本编辑器示例 -->
<template>
  <div class="page-container">
    <el-button
      class="mb-[20px]"
      tag="a"
      href="https://gitee.com/youlaiorg/vue3-element-admin/blob/master/src/views/demo/component/wang-editor.vue"
      target="_blank"
      link
      type="info"
      size="small"
    >
      <el-icon class="mr-1"><Link /></el-icon>
      示例源码
    </el-button>
    <WangEditor v-model="value" height="400px" />

    <div style="margin-top: 10px">
      <textarea v-model="value" readonly style="width: 100%; height: 200px; outline: none" />
    </div>
  </div>
</template>

<script setup lang="ts">
// 必须显式导入：页面文件名 wang-editor.vue 与标签 <WangEditor> 同名，会触发 Vue 隐式自引用
// （自动导入对同名组件不生效，运行时解析到页面自身 → 递归栈溢出白屏）
import WangEditor from "@/components/WangEditor/index.vue";

const value = ref("初始化内容");
</script>
