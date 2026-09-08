<template>
  <div class="designer-container">
    <div class="designer-toolbar">
      <div class="designer-toolbar__left">
        <el-button circle @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <span class="designer-toolbar__title">{{ title }}</span>
      </div>
      <div class="designer-toolbar__right">
        <el-button type="primary" :loading="saving" @click="designerRef?.save()">保 存</el-button>
      </div>
    </div>

    <div v-loading="loading" class="designer-wrapper">
      <BpmnDesigner ref="designerRef" :title="title" :xml="xml" @save="handleSave" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus";
import { ArrowLeft } from "@element-plus/icons-vue";

import WorkflowAPI from "@/api/workflow";
import router from "@/router";
import BpmnDesigner from "./components/BpmnDesigner.vue";

defineOptions({
  name: "WorkflowDesigner",
  inheritAttrs: false,
});

const route = useRoute();

/** 模型 ID（设计器始终由列表页"设计"按钮带参进入） */
const modelId = computed(() => String(route.query.modelId ?? ""));

/** 页面标题（列表页携带，如【请假审批】流程设计） */
const title = computed(() => String(route.query.title ?? "流程设计"));

const designerRef = ref<InstanceType<typeof BpmnDesigner>>();

/** 回显的 BPMN XML（新模型为空串，画布空白可自由拖拽） */
const xml = ref("");

const loading = ref(false);
const saving = ref(false);

onMounted(() => {
  // 无参进入（直接访问隐藏路由/URL 丢参），设计器无法工作，提示后跳回模型列表
  if (!modelId.value) {
    ElMessage.error("缺少模型ID参数，请从流程设计列表进入");
    router.replace({ name: "WorkflowModel" });
    return;
  }
  loadXml();
});

// 菜单 keep_alive=1 缓存页面，换模型再次进入需按 modelId 重载画布；
// 离开页面时 query 置空，跳过重载避免缓存页误报"缺少模型ID参数"
watch(modelId, (val) => {
  if (val) loadXml();
});

/**
 * 加载模型 BPMN XML（首次进入与切换模型共用）
 */
async function loadXml(): Promise<void> {
  if (!modelId.value) {
    ElMessage.error("缺少模型ID参数");
    return;
  }
  loading.value = true;
  try {
    const data = await WorkflowAPI.model.getXml(modelId.value);
    xml.value = data.xml ?? "";
  } finally {
    loading.value = false;
  }
}

/**
 * 保存设计器产出的 BPMN XML
 *
 * @param xml 设计器导出的 XML
 */
async function handleSave(xml: string): Promise<void> {
  if (!modelId.value) {
    ElMessage.error("缺少模型ID参数");
    return;
  }
  saving.value = true;
  try {
    await WorkflowAPI.model.saveXml(modelId.value, xml);
    designerRef.value?.markSaved();
    ElMessage.success("保存成功");
  } finally {
    saving.value = false;
  }
}

/**
 * 返回流程设计列表（有未保存修改时二次确认）
 */
async function handleBack(): Promise<void> {
  if (designerRef.value?.isDirty()) {
    try {
      await ElMessageBox.confirm("画布有未保存的修改，离开将丢失，确定返回?", "提示", {
        confirmButtonText: "确定离开",
        cancelButtonText: "留在本页",
        type: "warning",
      });
    } catch {
      return;
    }
  }
  router.back();
}
</script>

<style lang="scss" scoped>
.designer-container {
  display: flex;
  flex-direction: column;
  // 视口高度减去导航栏、标签栏及容器内边距
  height: calc(100vh - 120px);
  overflow: hidden;
  background-color: var(--el-bg-color);
}

.designer-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  border-bottom: 1px solid var(--el-border-color-light);

  &__left {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}

.designer-wrapper {
  flex: 1;
  min-height: 0;
}
</style>
