<template>
  <div class="p-3 border border-dashed border-[var(--el-border-color)] rounded-md">
    <div class="flex items-center gap-2 mb-2 text-12px text-[var(--el-text-color-secondary)]">
      <el-tag size="small" effect="plain">第 2 级</el-tag>
      <span>level-two · 路径分组，本身不渲染组件</span>
    </div>
    <el-alert :closable="false" title="二级菜单的示意内容" type="success" />
    <el-input
      v-model="inputText"
      class="mt-2"
      placeholder="缓存测试：输入内容后切到三级菜单 B 再回来"
    />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "LevelTwoPanel" });

// 缓存测试输入内容
const inputText = ref("");
</script>
