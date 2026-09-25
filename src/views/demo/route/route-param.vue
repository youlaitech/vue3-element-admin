<template>
  <div class="page-container">
    <RouteInfoPanel
      class="mb-4"
      title="路由参数：同一个页面，两条菜单进入"
      description="侧边栏两条菜单指向同一个文件 demo/route/route-param，靠各自 sys_menu.params 里的 type 决定页面显示哪套内容。"
    />

    <el-card class="page-content" shadow="never">
      <template #header>参数传递链路</template>

      <div class="flex flex-wrap items-center gap-2.5">
        <template v-for="(node, index) in flowNodes" :key="node.label">
          <div class="flex flex-col gap-1 py-2.5 px-3.5 bg-[var(--el-fill-color-light)] rounded-md">
            <span class="text-12px text-[var(--el-text-color-secondary)]">{{ node.label }}</span>
            <code class="font-mono text-13px text-[var(--el-color-primary)]">{{ node.code }}</code>
          </div>
          <span v-if="index < flowNodes.length - 1" class="text-[var(--el-text-color-placeholder)]">
            →
          </span>
        </template>
      </div>

      <el-row class="mt-4" :gutter="16">
        <el-col v-for="entry in entries" :key="entry.type" :span="12">
          <div
            class="param-entry h-full p-3.5"
            :class="{ 'is-active': currentType === entry.type }"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="text-14px font-600 text-[var(--el-text-color-primary)]">
                菜单「{{ entry.menu }}」
              </span>
              <el-tag v-if="currentType === entry.type" type="success" size="small">
                当前入口
              </el-tag>
            </div>
            <div class="font-mono text-12px leading-[1.8] text-[var(--el-text-color-secondary)]">
              {{ entry.path }}
            </div>
            <div class="font-mono text-12px leading-[1.8] text-[var(--el-text-color-secondary)]">
              sys_menu.params：{{ entry.params }}
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="page-content mt-4" shadow="never">
      <template #header>当前视图（由 type 决定，两条菜单看到的完全不同）</template>

      <el-table v-if="currentType === '1'" :data="employees" border>
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="post" label="岗位" />
        <el-table-column prop="city" label="城市" />
      </el-table>

      <el-row v-else-if="currentType === '2'" :gutter="16">
        <el-col v-for="item in deptStats" :key="item.label" :span="6">
          <div class="p-3 bg-[var(--el-fill-color-light)] rounded-md">
            <div class="text-13px text-[var(--el-text-color-secondary)]">{{ item.label }}</div>
            <div class="mt-1 text-20px font-600 text-[var(--el-color-primary)]">
              {{ item.value }}
            </div>
          </div>
        </el-col>
      </el-row>

      <el-empty v-else description="没有收到 type 参数，通常是直接在地址栏输入路径访问的" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import RouteInfoPanel from "./components/RouteInfoPanel.vue";

defineOptions({
  name: "RouteParamDemo",
});

const route = useRoute();

// 当前入口携带的 type 参数
const currentType = computed(() => String(route.query.type ?? ""));

// 参数从数据库到页面的四步链路
const flowNodes = [
  { label: "数据库", code: "sys_menu.params" },
  { label: "后端下发", code: "route.meta.params" },
  { label: "侧边栏跳转", code: "query: meta.params" },
  { label: "页面读取", code: "route.query.type" },
];

// 两条菜单入口的对照信息
const entries = [
  {
    type: "1",
    menu: "路由参数(type=1)",
    path: "/route-example/params-type-1?type=1",
    params: '{ "type": "1" }',
  },
  {
    type: "2",
    menu: "路由参数(type=2)",
    path: "/route-example/params-type-2?type=2",
    params: '{ "type": "2" }',
  },
];

// type=1 时展示的列表视图数据
const employees = [
  { name: "张三", post: "前端开发", city: "杭州" },
  { name: "李四", post: "后端开发", city: "上海" },
  { name: "王五", post: "产品经理", city: "北京" },
];

// type=2 时展示的统计视图数据
const deptStats = [
  { label: "研发部", value: 42 },
  { label: "产品部", value: 18 },
  { label: "测试部", value: 15 },
  { label: "运维部", value: 9 },
];
</script>

<style lang="scss" scoped>
/* 仅保留带状态与修饰符的样式，其余排版走原子类 */
.param-entry {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  transition: all 0.2s;

  &.is-active {
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary);
  }
}
</style>
