<template>
  <div class="launch-container">
    <el-card class="launch-card" shadow="never">
      <template #header>
        <div class="launch-card__header">
          <span class="launch-card__title">发起流程</span>
          <el-select
            v-model="selectedId"
            placeholder="请选择要发起的流程"
            class="launch-card__select"
            @change="handleProcessChange"
          >
            <el-option
              v-for="process in processList"
              :key="process.id"
              :label="`${process.name}（v${process.version}）`"
              :value="process.id"
            />
          </el-select>
        </div>
      </template>

      <!-- 演示引导：告诉体验者用哪些账号走完整个流程，可关闭 -->
      <el-alert
        v-if="demoTipVisible"
        class="launch-card__demo-tip"
        type="info"
        show-icon
        :closable="true"
        title="工作流演示说明"
        description="用 employee 发起后，依次切换各环节审批人（dept_manager、manager、finance、clerk）在「审批中心」的待办页签中审批，即可走完流程。数据乱了可在「流程设计」页重置。"
        @close="demoTipVisible = false"
      />

      <!-- 流程实例名称：默认可自动拼接流程-姓名-时间，发起人可改以区分同流程的多次发起 -->
      <el-form v-if="selectedProcess" class="launch-card__name-form" label-position="top">
        <el-form-item label="流程名称">
          <el-input
            v-model="processName"
            placeholder="例：报销审批-张三-09月07日"
            clearable
            @input="handleNameInput"
          />
          <div v-if="autoNameDirty" class="launch-card__name-reset">
            <el-link type="primary" :underline="false" @click="resetAutoName">恢复自动命名</el-link>
          </div>
        </el-form-item>
      </el-form>

      <!-- 审批流程走向预览：发起前即可见各环节的审批角色与办理人（全部待开始） -->
      <ProcessStages
        v-if="stages.length"
        :stages="stages"
        :active="-1"
        class="launch-card__stages"
      />

      <!-- 绑定表单的流程：FormRenderer 渲染发起表单，提交即发起 -->
      <FormRenderer
        v-if="selectedProcess?.formKey"
        :title="selectedProcess.name"
        :rule="rule"
        :option="option"
        :loading="loading"
        :submitted="submitted"
        @submit="handleSubmit"
      >
        <template #success>
          <el-result icon="success" title="流程发起成功">
            <template #extra>
              <el-button type="primary" @click="refill">继续发起</el-button>
              <el-button @click="goMyTasks">查看流程进度</el-button>
            </template>
          </el-result>
        </template>
      </FormRenderer>

      <!-- 未绑定表单的流程：确认即发起 -->
      <el-empty v-else-if="selectedProcess" description="该流程未绑定表单，确认后直接发起">
        <el-button type="primary" :loading="starting" @click="handleDirectStart">
          发起流程
        </el-button>
      </el-empty>

      <el-empty v-else description="请选择要发起的流程" :image-size="80" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";

import WorkflowAPI from "@/api/workflow";
import type { ProcessStageItem, StartableProcessItem } from "@/api/workflow";
import FormAPI from "@/api/form";
import router from "@/router";
import { useUserStore } from "@/stores";
import FormRenderer from "../dynamic-form/components/FormRenderer.vue";
import { useFormRenderer } from "../dynamic-form/composables/useFormRenderer";
import ProcessStages from "./components/ProcessStages.vue";

defineOptions({
  name: "WorkflowLaunch",
  inheritAttrs: false,
});

/** 演示引导提示条可见状态（关闭后本次会话不再显示） */
const demoTipVisible = ref(true);

/** 可发起流程列表 */
const processList = ref<StartableProcessItem[]>([]);

const selectedId = ref("");

const selectedProcess = computed(() =>
  processList.value.find((process) => process.id === selectedId.value)
);

/** 审批流程走向预览 */
const stages = ref<ProcessStageItem[]>([]);

const userStore = useUserStore();

/**
 * 流程实例名称：默认按"流程-姓名-时间"自动拼接，切换流程或手动修改后重置，
 * 用户可编辑以获得可读标题（同一流程多次发起也能从列表一眼区分）
 */
const processName = ref("");
const autoNameValue = ref("");
/** 名称被手动修改过：区别于自动值，展示"恢复自动命名"入口 */
const autoNameDirty = ref(false);

/**
 * 生成默认流程名称：流程名-昵称-MM月DD日
 *
 * <p>精确到日即可：同日多次发起由列表的"发起时间"列区分，名称保持简洁；特殊情况可手动编辑</p>
 */
function buildAutoName(): string {
  const nickname = userStore.userInfo?.nickname || userStore.userInfo?.username || "";
  const now = new Date();
  const pad = (num: number) => String(num).padStart(2, "0");
  return selectedProcess.value
    ? `${selectedProcess.value.name}-${nickname}-${pad(now.getMonth() + 1)}月${pad(now.getDate())}日`
    : "";
}

/**
 * 切换流程后重置自动命名，并回填默认拼接值
 */
function applyAutoName(): void {
  autoNameValue.value = buildAutoName();
  processName.value = autoNameValue.value;
  autoNameDirty.value = false;
}

/**
 * 用户手动编辑名称：与自动值不同视为已修改，清除自动状态
 */
function handleNameInput(value: string): void {
  autoNameDirty.value = value !== autoNameValue.value;
}

/**
 * 恢复为自动拼接的默认名称
 */
function resetAutoName(): void {
  processName.value = autoNameValue.value;
  autoNameDirty.value = false;
}

/** 发起表单渲染状态（复用动态表单渲染管线，保证与填写页一致） */
const { rule, option, loading, submitted, load, refill } = useFormRenderer(() =>
  FormAPI.getRender(selectedProcess.value?.formKey ?? "")
);

const starting = ref(false);

onMounted(async () => {
  processList.value = await WorkflowAPI.definition.listStartable();
});

/**
 * 切换流程时按 formKey 加载发起表单规则与审批走向
 *
 * 未绑定表单的流程走确认直发，不加载规则
 */
async function handleProcessChange(): Promise<void> {
  submitted.value = false;
  applyAutoName();
  if (selectedProcess.value?.formKey) {
    load();
  }
  stages.value = selectedId.value ? await WorkflowAPI.definition.listStages(selectedId.value) : [];
}

/**
 * 提交发起表单并发起流程（表单数据即流程变量，驱动网关条件）
 *
 * @param data 表单数据（field -> value 映射）
 */
async function handleSubmit(data: Record<string, unknown>): Promise<void> {
  await WorkflowAPI.instance.start({
    processDefinitionId: selectedId.value,
    name: processName.value,
    formData: data,
  });
  submitted.value = true;
}

/**
 * 未绑定表单流程的直接发起
 */
async function handleDirectStart(): Promise<void> {
  starting.value = true;
  try {
    await WorkflowAPI.instance.start({
      processDefinitionId: selectedId.value,
      name: processName.value,
    });
    ElMessage.success("流程发起成功");
    goMyTasks();
  } finally {
    starting.value = false;
  }
}

/**
 * 跳转审批中心「我发起的」页签查看进度
 */
function goMyTasks(): void {
  router.push({ name: "WorkflowTask", query: { tab: "mine" } });
}
</script>

<style lang="scss" scoped>
.launch-container {
  display: flex;
  justify-content: center;
  padding: 16px;
}

.launch-card {
  align-self: flex-start;
  width: 100%;
  max-width: 900px;

  &__header {
    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: space-between;
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  &__select {
    width: 280px;
  }

  &__demo-tip {
    margin-bottom: 16px;
  }

  &__name-form {
    :deep(.el-form-item) {
      margin-bottom: 16px;
    }
  }

  &__name-reset {
    display: flex;
    justify-content: flex-end;
    margin-top: 2px;
  }

  &__stages {
    margin-bottom: 16px;
  }
}
</style>
