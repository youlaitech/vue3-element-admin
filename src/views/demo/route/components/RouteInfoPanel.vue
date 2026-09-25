<template>
  <section
    class="p-4 bg-[var(--el-bg-color)] border border-solid border-[var(--el-border-color-lighter)] rounded-md"
  >
    <header class="mb-3">
      <h3 class="m-0 text-base font-600 text-[var(--el-text-color-primary)]">{{ title }}</h3>
      <p
        v-if="description"
        class="mt-1.5 mb-0 text-13px leading-[1.6] text-[var(--el-text-color-secondary)]"
      >
        {{ description }}
      </p>
    </header>

    <el-descriptions :column="2" border size="small">
      <el-descriptions-item label="路由 name">{{ route.name || "-" }}</el-descriptions-item>
      <el-descriptions-item label="完整路径">{{ route.fullPath }}</el-descriptions-item>
      <el-descriptions-item label="路径参数 params">
        {{ formatValue(route.params) }}
      </el-descriptions-item>
      <el-descriptions-item label="查询参数 query">
        {{ formatValue(route.query) }}
      </el-descriptions-item>
      <el-descriptions-item label="页面缓存 keepAlive">
        <el-tag :type="route.meta.keepAlive ? 'success' : 'info'" size="small" disable-transitions>
          {{ route.meta.keepAlive ? "开启" : "关闭" }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="菜单参数 meta.params">
        {{ formatValue(route.meta.params) }}
      </el-descriptions-item>
      <el-descriptions-item label="路由匹配链 matched" :span="2">
        <div class="flex flex-wrap items-center gap-2">
          <template v-for="(item, index) in matchedChain" :key="index">
            <el-tag size="small" effect="plain">{{ item.name }}</el-tag>
            <span class="font-mono text-12px text-[var(--el-text-color-secondary)]">
              {{ item.path || "/" }}
            </span>
            <span
              v-if="index < matchedChain.length - 1"
              class="text-[var(--el-text-color-placeholder)]"
            >
              /
            </span>
          </template>
        </div>
      </el-descriptions-item>
    </el-descriptions>
  </section>
</template>

<script setup lang="ts">
defineOptions({
  name: "RouteInfoPanel",
});

defineProps<{
  /** 面板标题 */
  title: string;
  /** 标题下方的补充说明 */
  description?: string;
}>();

const route = useRoute();

// 路由匹配链，自顶向下每一层的 name 与 path
const matchedChain = computed(() =>
  route.matched.map((item) => ({
    name: typeof item.name === "string" ? item.name : "（无名）",
    path: item.path,
  }))
);

/**
 * 空对象与空值统一显示为「无」，避免面板出现 {} 这种无信息量内容
 */
function formatValue(value: unknown): string {
  if (!value || typeof value !== "object") return "无";
  return Object.keys(value as object).length ? JSON.stringify(value) : "无";
}
</script>
