<!-- 字典组件示例 -->
<template>
  <div class="page-container">
    <el-button
      class="mb-[20px]"
      tag="a"
      href="https://gitee.com/youlaiorg/vue3-element-admin/blob/master/src/views/demo/component/dictionary.vue"
      target="_blank"
      link
      type="info"
      size="small"
    >
      <el-icon class="mr-1"><Link /></el-icon>
      示例源码
    </el-button>
    <el-form>
      <el-form-item label="性别">
        <DictSelect v-model="stringValue" code="gender" />
        <el-link underline="never" type="primary" class="ml-5">
          值为String: const value = ref("1");
        </el-link>
      </el-form-item>

      <el-form-item label="性别">
        <DictSelect v-model="numberValue" code="gender" />
        <el-link underline="never" type="success" class="ml-5">
          值为Number: const value = ref(1);
        </el-link>
      </el-form-item>

      <el-form-item label="单选框字典">
        <DictSelect v-model="numberValue" type="radio" code="gender" />
        <el-link underline="never" type="success" class="ml-5">
          值为Number: const value = ref(1);
        </el-link>
      </el-form-item>

      <el-form-item label="复选框字典">
        <DictSelect v-model="arrayValue" type="checkbox" code="gender" />
        <el-link underline="never" type="success" class="ml-5">
          值为Array: const value = ref(["1", "2"]);
        </el-link>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
const stringValue = ref("1"); // 性别(值为String)
const numberValue = ref(1); // 性别(值为Number)
const arrayValue = ref(["1", "2"]); // 性别(值为Array)
</script>
