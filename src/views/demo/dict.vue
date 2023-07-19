<!-- 字典组件示例 -->
<script setup lang="ts">
const genderDefaultValue = ref("1"); // 性别默认
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
        <dictionary v-model="genderDefaultValue" type-code="gender" />
      </el-form-item>
    </el-form>
  </div>
</template>
