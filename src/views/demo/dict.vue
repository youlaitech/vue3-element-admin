<!-- 字典组件示例 -->
<script setup lang="ts">
const stringValue = ref("1"); // 性别(值为String)
const numberValue = ref(1); // 性别(值为Number)
</script>

<template>
  <div class="app-container">
    <el-link
      href="https://gitee.com/youlaiorg/vue3-element-admin/blob/master/src/views/demo/dict.vue"
      type="primary"
      target="_blank"
      class="mb-[20px]"
      >示例源码 请点击>>>></el-link
    >
    <el-form>
      <el-form-item label="性别">
        <dictionary v-model="stringValue" type-code="gender" />
        <el-link :underline="false" type="primary" class="ml-5"
          >值为String: const value = ref("1");
        </el-link>
      </el-form-item>

      <el-form-item label="性别">
        <dictionary v-model="numberValue" type-code="gender" />
        <el-link :underline="false" type="success" class="ml-5"
          >值为Number: const value = ref(1);
        </el-link>
      </el-form-item>
    </el-form>
  </div>
</template>
