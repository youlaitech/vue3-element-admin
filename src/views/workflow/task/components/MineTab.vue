<template>
  <div>
    <el-card class="page-search" shadow="never">
      <el-form ref="queryFormRef" :model="params" :inline="true">
        <el-form-item label="关键字" prop="keywords">
          <el-input
            v-model="params.keywords"
            placeholder="流程名称"
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
          <el-table-column
            label="流程名称"
            prop="processName"
            min-width="140"
            show-overflow-tooltip
          />
          <el-table-column
            label="流程标识"
            prop="processDefinitionKey"
            min-width="150"
            show-overflow-tooltip
          />
          <el-table-column label="状态" width="90" align="center">
            <template #default="scope">
              <el-tag :type="statusOptions[(scope.row as WorkflowInstanceItem).status].tag">
                {{ statusOptions[(scope.row as WorkflowInstanceItem).status].label }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="发起时间" prop="startTime" width="170" align="center" />
          <el-table-column label="结束时间" width="170" align="center">
            <template #default="scope">
              {{ (scope.row as WorkflowInstanceItem).endTime || "-" }}
            </template>
          </el-table-column>
          <el-table-column
            label="终止原因"
            prop="deleteReason"
            min-width="120"
            show-overflow-tooltip
          />
          <el-table-column fixed="right" label="操作" align="center" width="200">
            <template #default="scope">
              <el-button
                type="primary"
                link
                size="small"
                @click.stop="openDetail((scope.row as WorkflowInstanceItem).id)"
              >
                详情
              </el-button>
              <el-button
                v-if="(scope.row as WorkflowInstanceItem).status === 'running'"
                type="warning"
                link
                size="small"
                @click.stop="handleCancel((scope.row as WorkflowInstanceItem).id)"
              >
                撤销
              </el-button>
              <el-button
                v-if="(scope.row as WorkflowInstanceItem).status === 'running'"
                v-hasPerm="['workflow:instance:terminate']"
                type="danger"
                link
                size="small"
                @click.stop="handleTerminate((scope.row as WorkflowInstanceItem).id)"
              >
                终止
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
import { ElMessage, ElMessageBox, type FormInstance } from "element-plus";
import { Refresh } from "@element-plus/icons-vue";

import WorkflowAPI from "@/api/workflow";
import type {
  InstanceStatus,
  WorkflowInstanceItem,
  WorkflowInstanceQueryParams,
} from "@/api/workflow";
import { usePageTable } from "@/composables";
import InstanceDetailDrawer from "../../components/InstanceDetailDrawer.vue";

defineOptions({
  name: "WorkflowMineTab",
});

const tableWrapperRef = ref<HTMLElement | null>(null);
const { toggle: toggleFullscreen } = useFullscreen(tableWrapperRef);

const queryFormRef = ref<FormInstance>();

/** 实例状态展示映射（标签文案 + 标签色） */
const statusOptions: Record<
  InstanceStatus,
  { label: string; tag: "primary" | "success" | "danger" }
> = {
  running: { label: "运行中", tag: "primary" },
  finished: { label: "已完成", tag: "success" },
  terminated: { label: "已终止", tag: "danger" },
};

/** 分页表格数据管理 */
const { loading, list, total, params, fetchData, handleQuery, handleResetQuery } = usePageTable<
  WorkflowInstanceItem,
  WorkflowInstanceQueryParams
>({
  initialParams: {
    pageNum: 1,
    pageSize: 10,
    keywords: "",
  },
  request: WorkflowAPI.instance.getPage,
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
function openDetail(instanceId: string): void {
  detailDrawerRef.value?.open(instanceId);
}

/**
 * 撤销运行中的流程（仅发起人）
 *
 * @param instanceId 流程实例 ID
 */
async function handleCancel(instanceId: string): Promise<void> {
  try {
    await ElMessageBox.confirm("撤销后流程终止且不可恢复，确定撤销?", "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
  } catch {
    ElMessage.info("已取消撤销");
    return;
  }
  await WorkflowAPI.instance.cancel(instanceId);
  ElMessage.success("撤销成功");
  fetchData();
}

/**
 * 终止运行中的流程（管理员）
 *
 * @param instanceId 流程实例 ID
 */
async function handleTerminate(instanceId: string): Promise<void> {
  let reason: string;
  try {
    const { value } = await ElMessageBox.prompt("请输入终止原因", "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      inputPlaceholder: "终止原因将记录在流程历史中",
      inputValidator: (input: string) => !!input?.trim() || "请输入终止原因",
      type: "warning",
    });
    reason = value.trim();
  } catch {
    ElMessage.info("已取消终止");
    return;
  }
  await WorkflowAPI.instance.terminate(instanceId, reason);
  ElMessage.success("终止成功");
  fetchData();
}

onMounted(() => {
  handleQuery();
});
</script>
