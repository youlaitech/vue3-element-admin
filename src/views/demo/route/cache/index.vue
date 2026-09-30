<template>
  <div class="page-container">
    <el-card class="page-content" shadow="never">
      <template #header>缓存对照实验</template>

      <el-alert
        type="info"
        show-icon
        :closable="false"
        title="验证方式：在输入框写点内容 → 切到别的菜单再切回来"
        description="内容还在、且「组件挂载次数」不变，说明页面被 keep-alive 缓存；关掉顶部标签页再进来，则一切重置。"
      />

      <el-input v-model="inputText" class="mt-4" placeholder="随便输入一点内容，用于观察缓存效果" />

      <el-row class="mt-4" :gutter="16">
        <el-col v-for="item in counters" :key="item.label" :span="8">
          <div
            class="flex items-center justify-between p-3 bg-[var(--el-fill-color-light)] rounded-md"
          >
            <span class="text-13px text-[var(--el-text-color-secondary)]">{{ item.label }}</span>
            <span class="text-20px font-600 text-[var(--el-color-primary)]">{{ item.value }}</span>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script lang="ts">
// 模块作用域计数：组件实例被销毁重建时会继续累加，用它判断缓存是命中还是失效
let mountedTotal = 0;
</script>

<script setup lang="ts">
import { onActivated, onDeactivated } from "vue";

defineOptions({
  name: "RouteCache",
});

// 缓存观察用的输入内容
const inputText = ref("");

const mountedCount = ref(mountedTotal);
const activatedCount = ref(0);
const deactivatedCount = ref(0);

const counters = computed(() => [
  { label: "组件挂载次数", value: mountedCount.value },
  { label: "onActivated", value: activatedCount.value },
  { label: "onDeactivated", value: deactivatedCount.value },
]);

onMounted(() => {
  mountedTotal += 1;
  mountedCount.value = mountedTotal;
});

onActivated(() => {
  activatedCount.value += 1;
});

onDeactivated(() => {
  deactivatedCount.value += 1;
});
</script>
