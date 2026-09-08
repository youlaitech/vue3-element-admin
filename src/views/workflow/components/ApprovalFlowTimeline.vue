<template>
  <el-timeline v-if="stages.length > 0" class="approval-flow">
    <template v-for="(stage, index) in stages" :key="stage.nodeId">
      <!-- 环节的实际办理记录：驳回重办同一节点产生多条，全部按时间展示 -->
      <el-timeline-item
        v-for="record in recordsOf(stage.nodeId)"
        :key="`${stage.nodeId}-${record.startTime ?? index}`"
        :type="record.endTime ? 'success' : 'primary'"
        :hollow="!record.endTime"
      >
        <div class="approval-flow__title">
          <div class="approval-flow__name">
            <span>{{ stage.nodeName }}</span>
            <el-tag v-if="record.assignee" size="small" effect="plain">
              {{ record.assignee }}
            </el-tag>
          </div>
          <el-tag v-if="record.endTime" size="small" type="success" effect="light">已办理</el-tag>
          <el-tag v-else size="small" type="warning" effect="light">进行中</el-tag>
        </div>
        <div class="approval-flow__time">
          <template v-if="record.endTime">办理于 {{ record.endTime }}</template>
          <template v-else>
            {{
              record.assignee ? `等待 ${record.assignee} 办理` : `待 ${describe(stage)} 认领办理`
            }}
          </template>
        </div>
        <div v-if="record.comment" class="approval-flow__comment">{{ record.comment }}</div>
      </el-timeline-item>

      <!-- 无办理记录：运行中按位置区分"未到"与"未经过"（网关分支跳过），已结束均为未经过；
           两种情况均展示配置的办理人，便于了解该环节本应由谁处理 -->
      <el-timeline-item v-if="!hasRecord(stage.nodeId)" type="info" hollow>
        <div class="approval-flow__title" :class="{ 'is-skipped': !isUpcoming(index) }">
          <span>{{ stage.nodeName }}</span>
          <el-tag size="small" type="info" effect="plain">{{ pendingLabel(index) }}</el-tag>
        </div>
        <div
          v-if="describe(stage)"
          class="approval-flow__time"
          :class="{ 'is-skipped': !isUpcoming(index) }"
        >
          {{ describe(stage) }}
        </div>
      </el-timeline-item>
    </template>
  </el-timeline>
  <el-empty v-else description="暂无审批流程" :image-size="64" />
</template>

<script setup lang="ts">
import type { ApprovalHistoryItem, InstanceStatus, ProcessStageItem } from "@/api/workflow";

defineOptions({
  name: "ApprovalFlowTimeline",
});

/**
 * 审批流程时间线（流程走向 + 审批记录融合）
 *
 * @description 以设计环节为骨架按编排顺序展示，实际办理记录按 activityId 归位到环节：
 * 已办（办理人/意见/时间）、进行中（待认领或等待办理）、未到（运行中位于当前环节之后）、
 * 未经过（网关分支跳过或流程结束仍未到达），驳回重办的多轮记录全部保留
 */
const props = defineProps<{
  /** 审批环节（按 BPMN 编排顺序，含分支未走节点） */
  stages: ProcessStageItem[];
  /** 审批记录（按时间正序） */
  history: ApprovalHistoryItem[];
  /** 当前进行中环节下标（运行中有效） */
  active: number;
  /** 实例状态：非运行中视为已结束，无记录环节均为"未经过" */
  status: InstanceStatus;
}>();

/** 节点ID -> 办理记录（驳回重办为多条） */
const recordMap = computed(() => {
  const map = new Map<string, ApprovalHistoryItem[]>();
  props.history.forEach((item) => {
    if (!item.activityId) return;
    const list = map.get(item.activityId) ?? [];
    list.push(item);
    map.set(item.activityId, list);
  });
  return map;
});

function recordsOf(nodeId: string): ApprovalHistoryItem[] {
  return recordMap.value.get(nodeId) ?? [];
}

function hasRecord(nodeId: string): boolean {
  return recordsOf(nodeId).length > 0;
}

/** 是否"未到"：流程运行中且位于当前环节之后 */
function isUpcoming(index: number): boolean {
  return props.status === "running" && index >= props.active;
}

/** 无记录环节状态标签：未到（后续环节）/ 未经过（分支跳过或已结束） */
function pendingLabel(index: number): string {
  return isUpcoming(index) ? "未到" : "未经过";
}

/** 环节办理人描述：角色（成员账号）；发起人办理环节标注"发起人" */
function describe(stage: ProcessStageItem): string {
  if (stage.initiator) {
    return "发起人";
  }
  const roles = stage.roleNames.join("、");
  const users = stage.userNames.join("、");
  if (roles && users) {
    return `${roles}（${users}）`;
  }
  return roles || users || "未配置办理人";
}
</script>

<style lang="scss" scoped>
.approval-flow {
  padding-left: 4px;

  /* Element Plus 默认 wrapper 上移 3px（为单行纯文本设计），多行内容下
     标签顶部与节点连线贴边，视觉上边框被裁切；归零后按内容自然排版 */
  :deep(.el-timeline-item__wrapper) {
    top: 0;
  }

  &__title {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
    min-height: 24px;
    font-weight: 600;
    color: var(--el-text-color-primary);

    /* 未经过环节整体弱化，与已办/进行中形成层级差 */
    &.is-skipped {
      font-weight: 400;
      color: var(--el-text-color-secondary);
    }
  }

  &__name {
    display: flex;
    gap: 8px;
    align-items: center;
    min-width: 0;
  }

  &__time {
    margin-top: 4px;
    font-size: 12px;
    line-height: 20px;
    color: var(--el-text-color-secondary);
  }

  /* 审批意见引用块：左侧色条 + 浅底，与时间/标题形成视觉分层 */
  &__comment {
    padding: 6px 10px;
    margin-top: 6px;
    font-size: 13px;
    line-height: 20px;
    color: var(--el-text-color-regular);
    word-break: break-all;
    background: var(--el-fill-color-light);
    border-left: 3px solid var(--el-color-primary-light-5);
    border-radius: 4px;
  }
}
</style>
