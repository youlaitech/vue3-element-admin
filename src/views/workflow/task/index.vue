<template>
  <div class="page-container">
    <!-- 审批中心：待办/已办/我发起的为个人视角三类数据（钉钉审批中心模式），页签聚合免跳页 -->
    <!-- 切换页签即时刷新对应列表（办理/发起后切页签即见最新数据） -->
    <el-tabs v-model="activeTab" class="workflow-task__tabs" @tab-change="handleTabChange">
      <el-tab-pane name="todo">
        <template #label>
          <span class="workflow-task__label">
            待办
            <el-badge v-if="todoTotal > 0" :value="todoTotal" :max="99" />
          </span>
        </template>
        <TodoTab ref="todoTabRef" class="workflow-task__panel" @total-change="todoTotal = $event" />
      </el-tab-pane>

      <el-tab-pane name="done" label="已办" lazy>
        <DoneTab ref="doneTabRef" class="workflow-task__panel" />
      </el-tab-pane>

      <el-tab-pane name="mine" label="我发起的" lazy>
        <MineTab ref="mineTabRef" class="workflow-task__panel" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";

import TodoTab from "./components/TodoTab.vue";
import DoneTab from "./components/DoneTab.vue";
import MineTab from "./components/MineTab.vue";

defineOptions({
  name: "WorkflowTask",
});

const route = useRoute();

/** 当前页签；发起成功跳转携带 ?tab=mine 直达「我发起的」查看进度 */
const activeTab = ref((route.query.tab as string) || "todo");

/** 待办数量（TodoTab 查询后回传，驱动页签角标） */
const todoTotal = ref(0);

/** 各页签组件引用（调用其暴露的刷新能力） */
const todoTabRef = ref<InstanceType<typeof TodoTab>>();
const doneTabRef = ref<InstanceType<typeof DoneTab>>();
const mineTabRef = ref<InstanceType<typeof MineTab>>();

/**
 * 页签切换刷新对应列表
 *
 * @description lazy 页签首次激活时 ref 尚未就绪，由子组件 onMounted 自行首查，此处跳过不重复请求；
 * 再次切换时调用子组件刷新，保证办理/发起后切回页签即见最新数据
 */
function handleTabChange(name: string | number): void {
  if (name === "todo") {
    todoTabRef.value?.fetchData();
  } else if (name === "done") {
    doneTabRef.value?.fetchData();
  } else if (name === "mine") {
    mineTabRef.value?.fetchData();
  }
}
</script>

<style lang="scss" scoped>
.workflow-task {
  /* 页签栏卡片化，与页面搜索/内容卡片视觉一致 */
  &__tabs {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    min-height: 0;

    :deep(.el-tabs__header) {
      padding: 0 16px;
      margin-bottom: var(--page-gap);
      background: var(--content-bg);
      border: 1px solid var(--card-border);
      border-radius: var(--card-radius);
      box-shadow: var(--card-shadow);
    }

    :deep(.el-tabs__nav-wrap::after) {
      display: none;
    }

    :deep(.el-tabs__content) {
      flex: 1 1 auto;
      min-height: 0;
    }

    :deep(.el-tab-pane) {
      height: 100%;
    }
  }

  &__label {
    display: inline-flex;
    gap: 6px;
    align-items: center;
  }

  /* 页签面板：搜索卡片 + 内容卡片的纵向布局（类注入子组件根节点） */
  &__panel {
    display: flex;
    flex-direction: column;
    gap: var(--page-gap);
    height: 100%;
    min-height: 0;
  }
}
</style>
