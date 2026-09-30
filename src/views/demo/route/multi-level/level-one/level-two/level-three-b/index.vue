<template>
  <div class="page-container">
    <el-card class="page-content" shadow="never">
      <template #header>三级结构逐层拆解</template>

      <el-alert
        type="info"
        :closable="false"
        show-icon
        title="A 与 B 共享同一套上级目录"
        description="两条菜单同在 50101 之下，只是 route_path 与组件不同；再次强调，上级记录只是路径分组，不渲染组件。"
      />

      <div class="flex flex-col gap-3 mt-4">
        <LevelOnePanel />
        <LevelTwoPanel />
        <div
          class="p-3 bg-[var(--el-color-warning-light-9)] border border-solid border-[var(--el-color-warning-light-5)] rounded-md"
        >
          <div class="flex items-center gap-2 mb-2 text-12px text-[var(--el-text-color-secondary)]">
            <el-tag size="small" effect="plain">第 3 级</el-tag>
            <span>level-three-b · 当前页面组件</span>
          </div>
          <el-alert :closable="false" title="三级菜单 B 的内容" type="warning" />
        </div>
      </div>

      <el-divider />

      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p class="text-14px font-600 text-[var(--el-text-color-primary)]">页面缓存与跳转</p>
          <p class="mt-1.5 mb-0 text-13px leading-[1.7] text-[var(--el-text-color-secondary)]">
            两个三级页面各自独立缓存：在 A 里输入的内容切到 B 时不会带过来，切回 A
            仍然保留，说明缓存按完整路径分别存放。
          </p>
        </div>
        <ToDetail />
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import LevelOnePanel from "@/views/demo/route/multi-level/components/LevelOnePanel.vue";
import LevelTwoPanel from "@/views/demo/route/multi-level/components/LevelTwoPanel.vue";
import ToDetail from "@/views/demo/route/multi-level/components/ToDetail";

defineOptions({ name: "MultiLevelLevelThreeB" });
</script>
