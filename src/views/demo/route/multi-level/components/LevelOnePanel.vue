<template>
  <div class="p-3 border border-dashed border-[var(--el-border-color)] rounded-md">
    <div class="flex items-center gap-2 mb-2 text-12px text-[var(--el-text-color-secondary)]">
      <el-tag size="small" effect="plain">第 1 级</el-tag>
      <span>level-one · 路径分组，本身不渲染组件</span>
    </div>
    <el-alert :closable="false" title="一级菜单的示意内容" type="info" />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "LevelOnePanel" });
</script>
