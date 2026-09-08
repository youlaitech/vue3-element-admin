<template>
  <el-drawer v-model="visible" title="流程详情" size="720px">
    <el-skeleton v-if="loading" :rows="6" animated />
    <template v-else-if="detail">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="流程名称">
          {{ detail.processName }}
        </el-descriptions-item>
        <el-descriptions-item label="发起人">{{ detail.startUser || "-" }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusOptions[detail.status].tag">
            {{ statusOptions[detail.status].label }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="发起时间">{{ detail.startTime }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{ detail.endTime || "-" }}</el-descriptions-item>
        <el-descriptions-item label="终止原因">
          {{ detail.deleteReason || "-" }}
        </el-descriptions-item>
      </el-descriptions>

      <el-tabs class="instance-detail__tabs">
        <el-tab-pane label="表单数据">
          <FormDetail
            v-if="detail.formJson"
            :form-json="detail.formJson"
            :options-json="detail.optionsJson"
            :data-json="detail.dataJson"
          />
          <!-- formKey 有值说明流程绑定了表单，数据为空即发起数据已被清理（如重置过演示数据） -->
          <el-empty
            v-else-if="detail.formKey"
            description="表单数据不存在或已被清理"
            :image-size="64"
          />
          <el-empty v-else description="该流程未绑定表单" :image-size="64" />
        </el-tab-pane>
        <el-tab-pane label="审批流程">
          <ApprovalFlowTimeline
            :stages="detail.stages"
            :history="detail.history"
            :active="detail.activeStageIndex ?? 0"
            :status="detail.status"
          />
        </el-tab-pane>
        <el-tab-pane label="流程图" lazy>
          <div v-loading="diagramLoading" class="instance-detail__diagram">
            <BpmnViewer
              v-if="diagram.bpmnXml"
              :xml="diagram.bpmnXml"
              :executed-activity-ids="diagram.executedActivityIds"
              :active-activity-ids="diagram.activeActivityIds"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import WorkflowAPI from "@/api/workflow";
import type { InstanceDetailData, InstanceStatus, ProcessDiagramData } from "@/api/workflow";
import ApprovalFlowTimeline from "./ApprovalFlowTimeline.vue";
import BpmnViewer from "./BpmnViewer.vue";
import FormDetail from "./FormDetail.vue";

defineOptions({
  name: "InstanceDetailDrawer",
});

/** 实例状态展示映射（标签文案 + 标签色） */
const statusOptions: Record<
  InstanceStatus,
  { label: string; tag: "primary" | "success" | "danger" }
> = {
  running: { label: "运行中", tag: "primary" },
  finished: { label: "已完成", tag: "success" },
  terminated: { label: "已终止", tag: "danger" },
};

const visible = ref(false);
const loading = ref(false);

const detail = ref<InstanceDetailData>();

/** 流程图数据（详情抽屉"流程图"页签） */
const diagram = ref<ProcessDiagramData>({
  bpmnXml: "",
  executedActivityIds: [],
  activeActivityIds: [],
});

const diagramLoading = ref(false);

/**
 * 打开抽屉并加载实例详情与流程图
 *
 * @param instanceId 流程实例 ID
 */
async function open(instanceId: string): Promise<void> {
  visible.value = true;
  loading.value = true;
  diagramLoading.value = true;
  diagram.value = { bpmnXml: "", executedActivityIds: [], activeActivityIds: [] };
  try {
    // 详情与流程图互不依赖，并行加载
    [detail.value, diagram.value] = await Promise.all([
      WorkflowAPI.instance.getDetail(instanceId),
      WorkflowAPI.instance.getDiagram(instanceId),
    ]);
  } finally {
    loading.value = false;
    diagramLoading.value = false;
  }
}

defineExpose({ open });
</script>

<style lang="scss" scoped>
.instance-detail {
  &__tabs {
    margin-top: 16px;
  }

  &__diagram {
    height: 420px;
  }
}
</style>
