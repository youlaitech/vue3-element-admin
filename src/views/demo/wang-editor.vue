<!-- wangEditor富文本编辑器示例 -->
<script setup lang="ts">
import WangEditor from "@/components/WangEditor/index.vue";

const value = ref("初始化内容");
</script>

<template>
  <div class="app-container">
    <el-link
      href="https://gitee.com/youlaiorg/vue3-element-admin/blob/master/src/views/demo/wang-editor.vue"
      type="primary"
      target="_blank"
      class="mb-[20px]"
    >
      示例源码 请点击>>>>
    </el-link>
    <WangEditor v-model="value" height="400px" />

    <div style="margin-top: 10px">
      <textarea v-model="value" readonly style="width: 100%; height: 200px; outline: none" />
    </div>
  </div>
</template>
