<template>
  <el-timeline v-if="history.length > 0" class="approval-timeline">
    <el-timeline-item
      v-for="(item, index) in history"
      :key="index"
      :timestamp="item.startTime"
      :type="item.endTime ? 'success' : 'primary'"
      placement="top"
    >
      <div class="approval-timeline__title">
        <span>{{ item.activityName }}</span>
        <el-tag v-if="item.assignee" size="small" effect="plain">{{ item.assignee }}</el-tag>
        <el-tag v-else size="small" type="info" effect="plain">未办理</el-tag>
        <el-tag v-if="!item.endTime" size="small" type="warning" effect="plain">进行中</el-tag>
      </div>
      <div v-if="item.comment" class="approval-timeline__comment">{{ item.comment }}</div>
      <div v-if="item.endTime" class="approval-timeline__time">办理于 {{ item.endTime }}</div>
    </el-timeline-item>
  </el-timeline>
  <el-empty v-else description="暂无审批记录" :image-size="64" />
</template>

<script setup lang="ts">
import type { ApprovalHistoryItem } from "@/api/workflow";

defineOptions({
  name: "ApprovalTimeline",
  inheritAttrs: false,
});

/**
 * 审批记录时间线
 *
 * @description 按时间正序展示各节点办理人与审批意见，
 * 未办理节点（当前待办）以 primary 色区分
 */
defineProps<{
  /** 审批记录（按时间正序） */
  history: ApprovalHistoryItem[];
}>();
</script>

<style lang="scss" scoped>
.approval-timeline {
  padding-left: 4px;

  &__title {
    display: flex;
    gap: 8px;
    align-items: center;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  &__comment {
    margin-top: 4px;
    color: var(--el-text-color-regular);
  }

  &__time {
    margin-top: 2px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}
</style>
