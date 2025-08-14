<template>
  <div p-30px>
    <el-link
      href="https://gitee.com/youlaiorg/vue3-element-admin/blob/master/src/views/demo/multi-level/level1.vue"
      type="primary"
      target="_blank"
      class="mb-10"
    >
      示例源码 请点击>>>>
    </el-link>

    <div flex flex-col gap-20px>
      <el-alert :closable="false" title="菜单一级" />
      <KeepCache />
    </div>
  </div>
</template>
<script setup lang="ts">
import KeepCache from "@/components/KeepCache/index.vue";
defineOptions({ name: "MultiLevel1" });
</script>
