<template>
  <!-- simple 模式紧凑展示审批链；当前及之前环节为完成态，当前环节高亮进行中 -->
  <el-steps :active="active" simple finish-status="success" class="process-stages">
    <el-step
      v-for="stage in stages"
      :key="stage.nodeId"
      :title="stage.nodeName"
      :description="describe(stage)"
    />
  </el-steps>
</template>

<script setup lang="ts">
import type { ProcessStageItem } from "@/api/workflow";

defineOptions({
  name: "ProcessStages",
});

defineProps<{
  /** 审批环节（按 BPMN 编排顺序） */
  stages: ProcessStageItem[];
  /** 高亮位置：当前环节下标（之前为完成、当前为进行中）；发起页预览传 -1 表示全部待开始 */
  active: number;
}>();

/**
 * 环节办理人描述：角色（成员账号）；发起人办理环节标注"发起人"；未配置办理人的环节兜底提示
 */
function describe(stage: ProcessStageItem): string {
  if (stage.initiator) {
    return "发起人办理";
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
.process-stages {
  :deep(.el-step__title) {
    font-size: 13px;
    line-height: 22px;
  }

  :deep(.el-step__description) {
    font-size: 12px;
  }
}
</style>
