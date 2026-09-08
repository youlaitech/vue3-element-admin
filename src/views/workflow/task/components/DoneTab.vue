<template>
  <div>
    <el-card class="page-search" shadow="never">
      <el-form ref="queryFormRef" :model="params" :inline="true">
        <el-form-item label="关键字" prop="keywords">
          <el-input
            v-model="params.keywords"
            placeholder="任务名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleQuery">搜索</el-button>
          <el-button @click="handleResetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card ref="tableWrapperRef" class="page-content" shadow="never">
      <div class="page-toolbar">
        <div class="page-toolbar__left" />
        <div class="page-toolbar__right">
          <el-tooltip content="刷新" placement="top">
            <el-button class="page-icon-btn" @click="fetchData">
              <el-icon><Refresh /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="全屏" placement="top">
            <el-button class="page-icon-btn" @click="toggleFullscreen">
              <el-icon><FullScreen /></el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </div>

      <div class="page-table-wrapper">
        <el-table
          v-loading="loading"
          highlight-current-row
          :data="list"
          class="page-table"
          border
          height="100%"
        >
          <!-- 流程名称为主列：各流程首节点名相近（部门主管审批），流程名称才是区分项 -->
          <el-table-column
            label="流程名称"
            prop="processName"
            min-width="140"
            show-overflow-tooltip
          />
          <el-table-column label="任务名称" prop="name" min-width="140" show-overflow-tooltip />
          <el-table-column
            label="流程实例ID"
            prop="processInstanceId"
            min-width="200"
            show-overflow-tooltip
          />
          <el-table-column label="办理时间" prop="endTime" width="170" align="center" />
          <el-table-column label="处理意见" prop="comment" min-width="160" show-overflow-tooltip>
            <template #default="scope">
              {{ (scope.row as DoneTaskItem).comment || "-" }}
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" align="center" width="90">
            <template #default="scope">
              <el-button
                type="primary"
                link
                size="small"
                @click.stop="handleDetail((scope.row as DoneTaskItem).processInstanceId)"
              >
                详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <pagination
        v-if="total > 0"
        v-model:total="total"
        v-model:page="params.pageNum"
        v-model:limit="params.pageSize"
        @pagination="fetchData"
      />
    </el-card>

    <!-- 实例详情抽屉：表单数据 / 审批流程（走向+记录融合）/ 流程图 -->
    <InstanceDetailDrawer ref="detailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import { useFullscreen } from "@vueuse/core";
import type { FormInstance } from "element-plus";
import { Refresh } from "@element-plus/icons-vue";

import WorkflowAPI from "@/api/workflow";
import type { DoneTaskItem, WorkflowTaskQueryParams } from "@/api/workflow";
import { usePageTable } from "@/composables";
import InstanceDetailDrawer from "../../components/InstanceDetailDrawer.vue";

defineOptions({
  name: "WorkflowDoneTab",
});

const tableWrapperRef = ref<HTMLElement | null>(null);
const { toggle: toggleFullscreen } = useFullscreen(tableWrapperRef);

const queryFormRef = ref<FormInstance>();

/** 分页表格数据管理 */
const { loading, list, total, params, fetchData, handleQuery, handleResetQuery } = usePageTable<
  DoneTaskItem,
  WorkflowTaskQueryParams
>({
  initialParams: {
    pageNum: 1,
    pageSize: 10,
    keywords: "",
  },
  request: WorkflowAPI.task.getDonePage,
  onBeforeReset: () => queryFormRef.value?.resetFields(),
});

/** 暴露刷新能力：审批中心页签切换时父组件调用 */
defineExpose({ fetchData });

/** 实例详情抽屉 */
const detailDrawerRef = ref<InstanceType<typeof InstanceDetailDrawer>>();

/**
 * 打开实例详情抽屉
 *
 * @param instanceId 流程实例 ID
 */
function handleDetail(instanceId: string): void {
  detailDrawerRef.value?.open(instanceId);
}

onMounted(() => {
  handleQuery();
});
</script>
