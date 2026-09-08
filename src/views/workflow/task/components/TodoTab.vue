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
          <el-table-column label="创建时间" prop="createTime" width="170" align="center" />
          <el-table-column fixed="right" label="操作" align="center" width="100">
            <template #default="scope">
              <el-button
                type="primary"
                link
                size="small"
                @click.stop="openApprove((scope.row as TodoTaskItem).id)"
              >
                办理
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

    <!-- 审批办理弹窗：发起表单只读回显 + 审批记录 + 通过/驳回 -->
    <el-dialog v-model="approveState.visible" :title="approveState.title" width="760px">
      <el-skeleton v-if="approveState.loading" :rows="6" animated />
      <template v-else-if="detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="流程名称">{{ detail.processName }}</el-descriptions-item>
          <el-descriptions-item label="当前任务">{{ detail.taskName }}</el-descriptions-item>
        </el-descriptions>

        <el-tabs class="todo-approve__tabs">
          <el-tab-pane label="申请信息">
            <FormDetail
              v-if="detail.formJson"
              :form-json="detail.formJson"
              :options-json="detail.optionsJson"
              :data-json="detail.dataJson"
            />
            <el-empty v-else description="该流程未绑定表单" :image-size="64" />
          </el-tab-pane>
          <el-tab-pane label="流程走向">
            <ProcessStages
              v-if="detail.stages?.length"
              :stages="detail.stages"
              :active="currentStageIndex"
            />
            <el-empty v-else description="无可展示的流程走向" :image-size="64" />
          </el-tab-pane>
          <el-tab-pane label="审批记录">
            <ApprovalTimeline :history="detail.history" />
          </el-tab-pane>
        </el-tabs>

        <el-form label-width="80px">
          <el-form-item label="审批意见">
            <el-input v-model="comment" type="textarea" :rows="2" placeholder="请输入审批意见" />
          </el-form-item>

          <!-- 驳回模式：展开目标节点选择 -->
          <el-form-item v-if="rejectMode" label="驳回节点">
            <el-select v-model="rejectTargetId" placeholder="请选择驳回到的节点" class="!w-full">
              <el-option
                v-for="target in rejectTargets"
                :key="target.activityId"
                :label="target.activityName"
                :value="target.activityId"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </template>

      <template #footer>
        <div class="dialog-footer">
          <template v-if="!rejectMode">
            <el-button
              type="primary"
              :loading="submitting"
              :disabled="approveState.loading"
              @click="handleComplete"
            >
              通 过
            </el-button>
            <el-button type="warning" :disabled="approveState.loading" @click="handleRejectClick">
              驳 回
            </el-button>
            <el-button @click="approveState.visible = false">取 消</el-button>
          </template>
          <template v-else>
            <el-button type="warning" :loading="submitting" @click="handleReject">
              确认驳回
            </el-button>
            <el-button @click="closeRejectMode">返 回</el-button>
          </template>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { useFullscreen } from "@vueuse/core";
import { ElMessage, type FormInstance } from "element-plus";
import { Refresh } from "@element-plus/icons-vue";

import WorkflowAPI from "@/api/workflow";
import type {
  RejectTargetItem,
  TaskDetailData,
  TodoTaskItem,
  WorkflowTaskQueryParams,
} from "@/api/workflow";
import { usePageTable } from "@/composables";
import ApprovalTimeline from "../../components/ApprovalTimeline.vue";
import FormDetail from "../../components/FormDetail.vue";
import ProcessStages from "../../components/ProcessStages.vue";

defineOptions({
  name: "WorkflowTodoTab",
});

/** 待办数量回传（驱动审批中心页签角标） */
const emit = defineEmits<{
  totalChange: [total: number];
}>();

const tableWrapperRef = ref<HTMLElement | null>(null);
const { toggle: toggleFullscreen } = useFullscreen(tableWrapperRef);

const queryFormRef = ref<FormInstance>();

/** 分页表格数据管理 */
const { loading, list, total, params, fetchData, handleQuery, handleResetQuery } = usePageTable<
  TodoTaskItem,
  WorkflowTaskQueryParams
>({
  initialParams: {
    pageNum: 1,
    pageSize: 10,
    keywords: "",
  },
  request: WorkflowAPI.task.getTodoPage,
  onBeforeReset: () => queryFormRef.value?.resetFields(),
});

watch(total, (value) => emit("totalChange", value), { immediate: true });

/** 暴露刷新能力：审批中心页签切换时父组件调用 */
defineExpose({ fetchData });

/** 办理弹窗状态 */
const approveState = reactive({
  visible: false,
  loading: false,
  title: "审批办理",
});

/** 当前任务详情 */
const detail = ref<TaskDetailData>();

/** 审批意见（通过/驳回共用） */
const comment = ref("");

/** 当前任务在流程走向中的位置（节点ID精确匹配，当前环节高亮进行中，之前为已完成；未匹配时不高亮） */
const currentStageIndex = computed(() => {
  const stages = detail.value?.stages;
  if (!stages?.length || !detail.value?.taskDefinitionKey) {
    return 0;
  }
  return stages.findIndex((stage) => stage.nodeId === detail.value?.taskDefinitionKey);
});

/** 驳回模式状态 */
const rejectMode = ref(false);
const rejectTargets = ref<RejectTargetItem[]>([]);
const rejectTargetId = ref("");

const submitting = ref(false);

/**
 * 打开办理弹窗并加载任务详情
 *
 * @param taskId 任务 ID
 */
async function openApprove(taskId: string): Promise<void> {
  approveState.visible = true;
  approveState.loading = true;
  closeRejectMode();
  comment.value = "";
  try {
    detail.value = await WorkflowAPI.task.getDetail(taskId);
    approveState.title = `【${detail.value.taskName}】审批办理`;
  } finally {
    approveState.loading = false;
  }
}

/**
 * 切入驳回模式并加载可驳回的历史节点
 */
async function handleRejectClick(): Promise<void> {
  rejectTargets.value = await WorkflowAPI.task.listRejectTargets(detail.value!.taskId);
  if (rejectTargets.value.length === 0) {
    ElMessage.warning("当前任务无可驳回的历史节点");
    return;
  }
  rejectTargetId.value = rejectTargets.value[0].activityId;
  rejectMode.value = true;
}

/**
 * 退出驳回模式（保留已填意见）
 */
function closeRejectMode(): void {
  rejectMode.value = false;
  rejectTargets.value = [];
  rejectTargetId.value = "";
}

/**
 * 审批通过
 */
async function handleComplete(): Promise<void> {
  submitting.value = true;
  try {
    await WorkflowAPI.task.complete(detail.value!.taskId, { comment: comment.value });
    ElMessage.success("审批通过");
    approveState.visible = false;
    fetchData();
  } finally {
    submitting.value = false;
  }
}

/**
 * 驳回到指定历史节点
 */
async function handleReject(): Promise<void> {
  submitting.value = true;
  try {
    await WorkflowAPI.task.reject(detail.value!.taskId, {
      targetActivityId: rejectTargetId.value,
      comment: comment.value,
    });
    ElMessage.success("驳回成功");
    approveState.visible = false;
    fetchData();
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  handleQuery();
});
</script>

<style lang="scss" scoped>
.todo-approve {
  &__tabs {
    margin-top: 16px;
    margin-bottom: 8px;
  }
}
</style>
