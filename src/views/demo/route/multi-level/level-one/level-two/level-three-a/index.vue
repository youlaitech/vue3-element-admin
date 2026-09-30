<template>
  <div class="page-container">
    <el-card class="page-content" shadow="never">
      <template #header>三级结构逐层拆解</template>

      <el-alert
        type="info"
        :closable="false"
        show-icon
        title="只有最底层这条菜单记录渲染真实组件"
        description="多级菜单(5) 套 Layout 外壳；一级(501)、二级(50101) 是纯路径分组，不渲染组件；本页 5010101 才是真正渲染出来的页面。下面把各层内容放在一起对照。"
      />

      <div class="flex flex-col gap-3 mt-4">
        <LevelOnePanel />
        <LevelTwoPanel />
        <div
          class="p-3 bg-[var(--el-color-primary-light-9)] border border-solid border-[var(--el-color-primary-light-5)] rounded-md"
        >
          <div class="flex items-center gap-2 mb-2 text-12px text-[var(--el-text-color-secondary)]">
            <el-tag size="small" effect="plain">第 3 级</el-tag>
            <span>level-three-a · 当前页面组件</span>
          </div>
          <el-alert :closable="false" title="三级菜单 A 的内容" type="error" />
        </div>
      </div>

      <el-divider />

      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p class="text-14px font-600 text-[var(--el-text-color-primary)]">页面缓存与跳转</p>
          <p class="mt-1.5 mb-0 text-13px leading-[1.7] text-[var(--el-text-color-secondary)]">
            本页 keepAlive=1：在「第 2 级」的输入框写点内容，切到三级菜单 B
            再回来内容仍在；点右侧按钮跳转详情页，返回后同样保留。
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

defineOptions({ name: "MultiLevelLevelThreeA" });
</script>
