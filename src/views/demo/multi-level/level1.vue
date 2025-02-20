<template>
  <div style="padding: 30px">
    <el-link
      href="https://gitee.com/youlaiorg/vue3-element-admin/blob/master/src/views/demo/multi-level/level1.vue"
      type="primary"
      target="_blank"
      class="mb-10"
    >
      示例源码 请点击>>>>
    </el-link>

    <el-alert :closable="false" title="菜单一级">
      <router-view />
    </el-alert>
  </div>
</template>
