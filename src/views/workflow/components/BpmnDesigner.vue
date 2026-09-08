<template>
  <div class="bpmn-designer">
    <div class="bpmn-designer__toolbar">
      <span class="bpmn-designer__title">{{ title }}</span>
      <div class="bpmn-designer__actions">
        <el-tooltip content="缩小" placement="bottom">
          <el-button class="page-icon-btn" @click="handleZoom(-0.1)">
            <el-icon><ZoomOut /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip content="放大" placement="bottom">
          <el-button class="page-icon-btn" @click="handleZoom(0.1)">
            <el-icon><ZoomIn /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip content="适应画布" placement="bottom">
          <el-button class="page-icon-btn" @click="handleFitViewport">
            <el-icon><FullScreen /></el-icon>
          </el-button>
        </el-tooltip>
        <slot name="toolbar-extra" />
      </div>
    </div>

    <div class="bpmn-designer__body">
      <div ref="canvasRef" class="bpmn-designer__canvas" />

      <aside class="bpmn-designer__panel">
        <template v-if="selectedElement">
          <el-form label-width="80px" label-position="top" class="bpmn-designer__form">
            <el-form-item label="节点ID">
              <el-input :model-value="selectedElement.id" disabled />
            </el-form-item>
            <el-form-item label="节点名称">
              <el-input
                :model-value="selectedName"
                placeholder="如：部门主管审批"
                @update:model-value="updateProperty('name', $event)"
              />
            </el-form-item>

            <template v-if="isFormBindable">
              <el-form-item>
                <template #label>
                  <div class="flex-y-center">
                    发起表单
                    <el-tooltip
                      content="发起人启动流程时填写的表单，审批环节展示的也是这份表单数据"
                      placement="bottom"
                    >
                      <el-icon class="ml-1 cursor-pointer"><QuestionFilled /></el-icon>
                    </el-tooltip>
                  </div>
                </template>
                <el-select
                  :model-value="selectedFormKey"
                  filterable
                  clearable
                  placeholder="选择已发布的工作流表单"
                  class="w-full"
                  @update:model-value="updateProperty('formKey', String($event ?? ''))"
                >
                  <el-option
                    v-for="form in workflowFormOptions"
                    :key="form.value"
                    :label="form.label"
                    :value="String(form.value)"
                  />
                </el-select>
              </el-form-item>
            </template>

            <template v-if="isUserTask">
              <el-form-item>
                <template #label>
                  <div class="flex-y-center">
                    办理人
                    <el-tooltip
                      content="单个用户名（登录账号）或 ${initiator}（发起人本人）；任务直接进入其待办"
                      placement="bottom"
                    >
                      <el-icon class="ml-1 cursor-pointer"><QuestionFilled /></el-icon>
                    </el-tooltip>
                  </div>
                </template>
                <el-input
                  :model-value="selectedAssignee"
                  placeholder="如 admin 或 ${initiator}"
                  @update:model-value="updateProperty('assignee', $event)"
                />
              </el-form-item>
              <el-form-item>
                <template #label>
                  <div class="flex-y-center">
                    候选组
                    <el-tooltip
                      content="选择角色，可多选；角色成员均可在待办中认领办理"
                      placement="bottom"
                    >
                      <el-icon class="ml-1 cursor-pointer"><QuestionFilled /></el-icon>
                    </el-tooltip>
                  </div>
                </template>
                <el-select
                  :model-value="candidateGroupCodes"
                  multiple
                  filterable
                  collapse-tags
                  collapse-tags-tooltip
                  placeholder="选择可办理该节点的角色"
                  class="w-full"
                  @update:model-value="updateCandidateGroups"
                >
                  <el-option
                    v-for="role in roleCodeOptions"
                    :key="role.value"
                    :label="role.label"
                    :value="String(role.value)"
                  />
                </el-select>
              </el-form-item>
            </template>

            <template v-if="isSequenceFlow">
              <el-form-item>
                <template #label>
                  <div class="flex-y-center">
                    条件表达式
                    <el-tooltip
                      content="留空走默认分支；表达式引用表单字段或流程变量，如 ${days > 3}"
                      placement="bottom"
                    >
                      <el-icon class="ml-1 cursor-pointer"><QuestionFilled /></el-icon>
                    </el-tooltip>
                  </div>
                </template>
                <el-input
                  :model-value="selectedCondition"
                  type="textarea"
                  :rows="2"
                  placeholder="${days > 3}"
                  @update:model-value="updateCondition"
                />
              </el-form-item>
            </template>
          </el-form>
        </template>
        <el-empty v-else description="点击画布节点配置属性" :image-size="64" />
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
// palette/context-pad 样式与图标字体缺一不可，bpmn-embedded 内嵌字体免字体文件路径问题
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";

import Modeler from "bpmn-js/lib/Modeler";
import { is } from "bpmn-js/lib/util/ModelUtil";
import { FullScreen, QuestionFilled, ZoomIn, ZoomOut } from "@element-plus/icons-vue";
import type Modeling from "bpmn-js/lib/features/modeling/Modeling";
import type { Shape } from "bpmn-js/lib/model/Types";

import flowableModdleDescriptor from "./bpmn/flowable-moddle";
import RoleAPI from "@/api/system/role";
import FormAPI from "@/api/form";
import type { OptionItem } from "@/api/common";

/** 画布服务调用子集（diagram-js Canvas，pnpm 严格模式下不可直接引用其类型） */
interface CanvasLike {
  zoom(): number;
  zoom(scale: number | "fit-viewport"): number;
}

/** moddle 服务调用子集（创建条件表达式等 BPMN 元素） */
interface ModdleLike {
  create(descriptor: string, properties?: Record<string, unknown>): unknown;
}

defineOptions({
  name: "BpmnDesigner",
  inheritAttrs: false,
});

/**
 * BPMN 流程设计器
 *
 * @description bpmn-js 建模器 + 轻量属性面板（名称/表单标识/办理人/候选组/条件表达式），
 * 扩展 flowable 命名空间属性，保存时产出引擎可直接部署的 BPMN 2.0 XML
 */
const props = defineProps<{
  /** 设计器标题（工具栏展示） */
  title: string;
  /** BPMN 2.0 XML（导入渲染） */
  xml: string;
}>();

const emit = defineEmits<{
  /** 保存（抛出当前画布的 XML） */
  save: [xml: string];
}>();

const canvasRef = ref<HTMLElement | null>(null);
const modeler = shallowRef<Modeler>();

/** 脏标记：画布有未保存的修改（承载页据此拦截离开） */
const dirty = ref(false);

/** 当前选中元素（Shape/Connection 统称） */
const selectedElement = shallowRef<Shape | null>(null);

const isUserTask = computed(
  () => !!selectedElement.value && is(selectedElement.value, "bpmn:UserTask")
);
const isSequenceFlow = computed(
  () => !!selectedElement.value && is(selectedElement.value, "bpmn:SequenceFlow")
);
/** 仅开始节点可绑定表单（后端只读开始节点 formKey 渲染发起表单，审批展示复用同一份数据） */
const isFormBindable = computed(
  () => !!selectedElement.value && is(selectedElement.value, "bpmn:StartEvent")
);

const selectedName = computed(() => selectedElement.value?.businessObject?.name ?? "");
const selectedFormKey = computed(() => selectedElement.value?.businessObject?.get("formKey") ?? "");
const selectedAssignee = computed(
  () => selectedElement.value?.businessObject?.get("assignee") ?? ""
);
/** 候选组（角色编码，逗号分隔）与办理人二选一配置，均空发布时会被后端拦截 */
const selectedCandidateGroups = computed(
  () => selectedElement.value?.businessObject?.get("candidateGroups") ?? ""
);
/** 候选组多选值：XML 逗号串 ↔ 选项数组互转，数据结构保持引擎兼容 */
const candidateGroupCodes = computed(() =>
  String(selectedCandidateGroups.value)
    .split(",")
    .map((code) => code.trim())
    .filter(Boolean)
);
/** 角色编码选项（label 角色名 / value 角色编码） */
const roleCodeOptions = ref<OptionItem[]>([]);
/** 发起表单选项（label 表单名 / value formKey，仅已发布 workflow 类型） */
const workflowFormOptions = ref<OptionItem[]>([]);
const selectedCondition = computed(
  () => selectedElement.value?.businessObject?.conditionExpression?.body ?? ""
);

/**
 * 更新元素普通属性（名称/formKey/assignee/candidateGroups）
 *
 * @param property 属性名
 * @param value    属性值（空值传 undefined 移除属性，避免序列化出空串属性干扰引擎解析）
 */
function updateProperty(property: string, value: string): void {
  const element = selectedElement.value;
  if (!element) return;
  const modeling = modeler.value!.get("modeling") as Modeling;
  modeling.updateProperties(element, {
    [property]: value.trim() === "" ? undefined : value,
  });
  // bpmn-js 原地修改 businessObject，shallowRef 感知不到深值变更；
  // 手动触发依赖刷新，否则受控控件（表单下拉/办理人输入等）选中值不回显
  triggerRef(selectedElement);
}

/**
 * 更新候选组多选值（数组拼接为逗号串写入 candidateGroups）
 *
 * @param codes 选中的角色编码数组
 */
function updateCandidateGroups(codes: string[]): void {
  updateProperty("candidateGroups", codes.join(","));
}

/** 加载角色编码选项（候选组下拉数据源） */
async function loadRoleCodeOptions(): Promise<void> {
  roleCodeOptions.value = await RoleAPI.getCodeOptions();
}

/** 加载发起表单选项（formKey 下拉数据源） */
async function loadWorkflowFormOptions(): Promise<void> {
  workflowFormOptions.value = await FormAPI.getWorkflowOptions();
}

/**
 * 更新连线条件表达式（空值移除条件，走默认分支）
 *
 * @param value 条件表达式，如 ${days > 3}
 */
function updateCondition(value: string): void {
  const element = selectedElement.value;
  if (!element) return;
  const moddle = modeler.value!.get("moddle") as ModdleLike;
  const modeling = modeler.value!.get("modeling") as Modeling;
  const conditionExpression = value
    ? moddle.create("bpmn:FormalExpression", { body: value })
    : undefined;
  modeling.updateProperties(element, { conditionExpression });
  // 同 updateProperty：手动触发 shallowRef 依赖刷新，保证条件表达式回显
  triggerRef(selectedElement);
}

/**
 * 保存：导出当前画布 XML 并抛出
 */
async function handleSave(): Promise<void> {
  const { xml } = await modeler.value!.saveXML({ format: true });
  emit("save", xml ?? "");
}

/**
 * 画布缩放
 *
 * @param delta 缩放步长（正放大/负缩小）
 */
function handleZoom(delta: number): void {
  const canvas = modeler.value!.get("canvas") as CanvasLike;
  canvas.zoom(canvas.zoom() + delta);
}

/** 适应画布（完整展示流程图） */
function handleFitViewport(): void {
  (modeler.value!.get("canvas") as CanvasLike).zoom("fit-viewport");
}

/** 导入 XML 并选中态复位 */
async function importXml(xml: string): Promise<void> {
  if (!xml || !modeler.value) return;
  try {
    await modeler.value.importXML(xml);
    handleFitViewport();
  } catch (error) {
    console.error("BPMN 导入失败:", error);
  } finally {
    // importXML 亦走命令栈，回显不算脏
    dirty.value = false;
  }
}

watch(
  () => props.xml,
  (xml) => importXml(xml)
);

onMounted(() => {
  modeler.value = new Modeler({
    container: canvasRef.value!,
    moddleExtensions: { flowable: flowableModdleDescriptor },
  });
  // 选中变化时同步属性面板（多选只取首个）
  modeler.value.on("selection.changed", (event: { newSelection: Shape[] }) => {
    selectedElement.value = event.newSelection[0] ?? null;
  });
  // 任何建模操作（增删节点/连线/改属性）都会触发命令栈变更
  modeler.value.on("commandStack.changed", () => {
    dirty.value = true;
  });
  importXml(props.xml);
  loadRoleCodeOptions();
  loadWorkflowFormOptions();
});

onBeforeUnmount(() => {
  modeler.value?.destroy();
});

defineExpose({
  /** 供承载页触发的保存动作（与工具栏保存共用一套导出逻辑） */
  save: handleSave,
  /** 画布是否有未保存的修改 */
  isDirty: () => dirty.value,
  /** 持久化成功后清除脏标记（由承载页调用） */
  markSaved: () => {
    dirty.value = false;
  },
});
</script>

<style lang="scss" scoped>
.bpmn-designer {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 110px);
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: var(--el-border-radius-base);

  &__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  &__title {
    font-size: 15px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  &__actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  &__body {
    display: flex;
    flex: 1;
    min-height: 0;
  }

  &__canvas {
    flex: 1;
    min-width: 0;
  }

  &__panel {
    width: 260px;
    padding: 12px;
    overflow-y: auto;
    border-left: 1px solid var(--el-border-color-lighter);
  }

  &__form {
    :deep(.el-form-item__label) {
      margin-bottom: 4px;
    }
  }
}
</style>
