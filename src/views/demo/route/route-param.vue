<template>
  <div class="page-container">
    <el-card class="page-content" shadow="never">
      <template #header>
        <div class="flex items-center justify-between">
          <span>当前视图（由 query 的 type 决定）</span>
          <code class="param-query">?type={{ currentType }}</code>
        </div>
      </template>

      <el-radio-group :model-value="currentType" class="mb-4" @change="switchView">
        <el-radio-button v-for="item in views" :key="item.value" :value="item.value">
          {{ item.label }}
        </el-radio-button>
      </el-radio-group>

      <el-table v-if="currentType === 'staff'" :data="employees" border>
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="post" label="岗位" />
        <el-table-column prop="city" label="城市" />
      </el-table>

      <el-row v-else :gutter="16">
        <el-col v-for="item in deptStats" :key="item.label" :span="6">
          <div class="p-3 bg-[var(--el-fill-color-light)] rounded-md">
            <div class="text-13px text-[var(--el-text-color-secondary)]">{{ item.label }}</div>
            <div class="mt-1 text-20px font-600 text-[var(--el-color-primary)]">
              {{ item.value }}
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "RouteParam",
});

const route = useRoute();
const router = useRouter();

// 页内可切换的视图，取值对应 query 的 type
const views = [
  { value: "staff", label: "员工数据" },
  { value: "dept", label: "部门统计" },
];

// 当前视图：非法取值回退到第一个视图
const currentType = computed(() => {
  const value = String(route.query.type ?? "");
  return views.some((item) => item.value === value) ? value : views[0].value;
});

/**
 * 切换视图：改 query，与菜单 params 并入 query 是同一机制
 */
function switchView(value: string | number | boolean | undefined) {
  router.replace({ query: { ...route.query, type: String(value) } });
}

// staff 视图数据
const employees = [
  { name: "张三", post: "前端开发", city: "杭州" },
  { name: "李四", post: "后端开发", city: "上海" },
  { name: "王五", post: "产品经理", city: "北京" },
];

// dept 视图数据
const deptStats = [
  { label: "研发部", value: 42 },
  { label: "产品部", value: 18 },
  { label: "测试部", value: 15 },
  { label: "运维部", value: 9 },
];
</script>

<style lang="scss" scoped>
/* 仅保留带状态与修饰符的样式，其余排版走原子类 */
.param-query {
  padding: 2px 10px;
  font-family: var(--el-font-family-mono, monospace);
  font-size: 12px;
  color: var(--el-color-primary);
  background: var(--el-fill-color-light);
  border-radius: 4px;
}
</style>
