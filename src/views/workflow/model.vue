<template>
  <div class="page-container">
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
        <div class="page-toolbar__left">
          <el-button
            v-hasPerm="['workflow:model:create']"
            type="primary"
            @click="handleCreateClick"
          >
            新增
          </el-button>
          <el-button
            v-hasPerm="['workflow:model:delete']"
            type="danger"
            :disabled="!hasSelection"
            @click="handleDelete()"
          >
            删除
          </el-button>
          <el-button
            v-hasPerm="['workflow:model:reset']"
            type="warning"
            plain
            :loading="resetting"
            @click="handleResetDemo"
          >
            {{ resetting ? "重置中..." : "重置演示" }}
          </el-button>
        </div>
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
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="流程名称" min-width="150">
            <template #default="scope">
              <el-link
                type="primary"
                :underline="false"
                title="点击修改名称与描述"
                @click="handleEditClick(scope.row as WorkflowModelItem)"
              >
                {{ (scope.row as WorkflowModelItem).name }}
              </el-link>
            </template>
          </el-table-column>
          <el-table-column label="流程标识" prop="key" min-width="150" show-overflow-tooltip />
          <el-table-column label="描述" prop="description" min-width="150" show-overflow-tooltip />
          <!-- 开关即语义：开=可发起，关=不可发起；版本号标在开关左侧 -->
          <el-table-column label="启用" width="110" align="center">
            <template #default="scope">
              <el-tag
                v-if="!(scope.row as WorkflowModelItem).definitionId"
                type="info"
                size="small"
              >
                未发布
              </el-tag>
              <template v-else>
                <span class="publish-version">
                  v{{ (scope.row as WorkflowModelItem).publishedVersion }}
                </span>
                <el-switch
                  v-if="hasStatePerm"
                  :model-value="!(scope.row as WorkflowModelItem).suspended"
                  :loading="switchingId === (scope.row as WorkflowModelItem).id"
                  :disabled="switchingId !== null"
                  inline-prompt
                  @change="handleToggleState(scope.row as WorkflowModelItem)"
                />
                <el-tag
                  v-else
                  :type="(scope.row as WorkflowModelItem).suspended ? 'info' : 'success'"
                  size="small"
                >
                  {{ (scope.row as WorkflowModelItem).suspended ? "否" : "是" }}
                </el-tag>
              </template>
            </template>
          </el-table-column>
          <el-table-column label="更新时间" prop="updateTime" width="170" align="center" />
          <el-table-column fixed="right" label="操作" align="center" width="210">
            <template #default="scope">
              <el-button
                type="primary"
                link
                size="small"
                @click.stop="openDesigner(scope.row as WorkflowModelItem)"
              >
                设计
              </el-button>
              <el-button
                v-hasPerm="['workflow:model:deploy']"
                type="success"
                link
                size="small"
                @click.stop="handleDeploy((scope.row as WorkflowModelItem).id)"
              >
                发布
              </el-button>
              <el-button
                type="primary"
                link
                size="small"
                :disabled="!(scope.row as WorkflowModelItem).definitionId"
                @click.stop="openDiagram(scope.row as WorkflowModelItem)"
              >
                流程图
              </el-button>
              <el-button
                v-hasPerm="['workflow:model:delete']"
                type="danger"
                link
                size="small"
                @click.stop="handleDelete((scope.row as WorkflowModelItem).id)"
              >
                删除
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

    <el-dialog
      v-model="dialogState.visible"
      :title="dialogState.title"
      width="560px"
      @close="closeDialog"
    >
      <el-form ref="modelFormRef" :model="formData" :rules="rules" label-width="90px">
        <el-form-item label="流程名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入流程名称" />
        </el-form-item>

        <el-form-item prop="key">
          <template #label>
            <div class="flex-y-center">
              流程标识
              <el-tooltip content="创建后不可修改，建议用有业务含义的英文编码" placement="bottom">
                <el-icon class="ml-1 cursor-pointer">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
          <el-input
            v-model="formData.key"
            :disabled="!!formData.id"
            placeholder="如 leave_approval"
          />
        </el-form-item>

        <el-form-item label="流程描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入流程描述"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
          <el-button @click="closeDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 流程图弹窗：渲染已发布版本的 BPMN（只读，滚轮缩放） -->
    <el-dialog
      v-model="diagramState.visible"
      :title="diagramState.title"
      width="960px"
      append-to-body
    >
      <div v-loading="diagramState.loading" class="workflow-diagram">
        <BpmnViewer v-if="diagramState.xml" :xml="diagramState.xml" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { useFullscreen } from "@vueuse/core";
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus";
import { QuestionFilled, Refresh } from "@element-plus/icons-vue";

import WorkflowAPI from "@/api/workflow";
import type {
  WorkflowModelFormData,
  WorkflowModelItem,
  WorkflowModelQueryParams,
} from "@/api/workflow";
import router from "@/router";
import { hasPerm } from "@/utils/auth";
import { usePageTable, useTableSelection } from "@/composables";
import BpmnViewer from "./components/BpmnViewer.vue";

defineOptions({
  name: "WorkflowModel",
  inheritAttrs: false,
});

const tableWrapperRef = ref<HTMLElement | null>(null);
const { toggle: toggleFullscreen } = useFullscreen(tableWrapperRef);

const queryFormRef = ref<FormInstance>();
const modelFormRef = ref<FormInstance>();

/** 启用开关权限（el-switch 不支持 v-hasPerm 指令移除，改 v-if 控制） */
const hasStatePerm = hasPerm("workflow:definition:update");

/** 分页表格数据管理 */
const { loading, list, total, params, fetchData, handleQuery, handleResetQuery } = usePageTable<
  WorkflowModelItem,
  WorkflowModelQueryParams
>({
  initialParams: {
    pageNum: 1,
    pageSize: 10,
    keywords: "",
  },
  request: WorkflowAPI.model.getPage,
  onBeforeReset: () => queryFormRef.value?.resetFields(),
});

const { selectedIds, hasSelection, handleSelectionChange } = useTableSelection<WorkflowModelItem>();

const dialogState = reactive({
  title: "",
  visible: false,
});

const initialFormData: WorkflowModelFormData & { id?: string } = { name: "", key: "" };

const formData = reactive<WorkflowModelFormData & { id?: string }>({ ...initialFormData });

const rules: FormRules<WorkflowModelFormData> = {
  name: [{ required: true, message: "请输入流程名称", trigger: "blur" }],
  key: [
    { required: true, message: "请输入流程标识", trigger: "blur" },
    {
      pattern: /^[a-z][a-z0-9_]*$/,
      message: "须以小写字母开头，仅含小写字母、数字、下划线",
      trigger: "blur",
    },
  ],
};

/** 流程图弹窗状态 */
const diagramState = reactive({
  title: "",
  visible: false,
  loading: false,
  xml: "",
});

/** 正在切换启用状态的流程 ID（该行开关转圈，其余行禁用防并发） */
const switchingId = ref<string | null>(null);

/**
 * 重置表单数据和验证状态
 */
function resetForm(): void {
  modelFormRef.value?.resetFields();
  modelFormRef.value?.clearValidate();
  Object.keys(formData).forEach((key) => {
    delete (formData as Record<string, unknown>)[key];
  });
  Object.assign(formData, initialFormData);
}

/**
 * 关闭模型弹窗并清理临时状态
 */
function closeDialog(): void {
  dialogState.visible = false;
  resetForm();
}

/**
 * 打开新增流程弹窗
 */
function handleCreateClick(): void {
  resetForm();
  dialogState.title = "新增流程";
  dialogState.visible = true;
}

/**
 * 打开编辑流程弹窗并回填数据（列表名称列点击进入）
 *
 * @param row 当前流程行
 */
function handleEditClick(row: WorkflowModelItem): void {
  resetForm();
  dialogState.title = "修改流程";
  Object.assign(formData, {
    id: row.id,
    name: row.name,
    key: row.key,
    description: row.description,
  });
  dialogState.visible = true;
}

/**
 * 校验并提交模型
 */
async function handleSubmit(): Promise<void> {
  const valid = await modelFormRef.value?.validate().then(
    () => true,
    () => false
  );
  if (!valid) return;

  loading.value = true;
  try {
    if (formData.id) {
      await WorkflowAPI.model.update(formData.id, formData);
      ElMessage.success("修改成功");
    } else {
      await WorkflowAPI.model.create(formData);
      ElMessage.success("新增成功");
    }
    closeDialog();
    handleQuery();
  } finally {
    loading.value = false;
  }
}

/**
 * 发布流程（生成新版本，发布后即可发起）
 *
 * @param modelId 模型 ID
 */
async function handleDeploy(modelId: string): Promise<void> {
  try {
    await ElMessageBox.confirm("发布后即可发起流程，历史版本不受影响，确定发布?", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "info",
    });
  } catch {
    ElMessage.info("已取消发布");
    return;
  }
  await WorkflowAPI.model.deploy(modelId);
  ElMessage.success("发布成功");
  fetchData();
}

/**
 * 切换流程启用状态（关闭后不可发起新流程，运行中的实例不受影响）
 *
 * @param row 当前流程行
 */
async function handleToggleState(row: WorkflowModelItem): Promise<void> {
  if (!row.definitionId) return;
  const suspend = !row.suspended;
  switchingId.value = row.id;
  try {
    await WorkflowAPI.definition.updateState(row.definitionId, suspend);
    ElMessage.success(suspend ? "已关闭，不可发起" : "已开启，可发起");
    fetchData();
  } finally {
    switchingId.value = null;
  }
}

/**
 * 打开已发布版本的流程图弹窗
 *
 * @param row 当前流程行
 */
async function openDiagram(row: WorkflowModelItem): Promise<void> {
  if (!row.definitionId) {
    ElMessage.warning("该流程尚未发布，请先发布");
    return;
  }
  diagramState.title = `【${row.name}】流程图`;
  diagramState.xml = "";
  diagramState.visible = true;
  diagramState.loading = true;
  try {
    const data = await WorkflowAPI.definition.getXml(row.definitionId);
    diagramState.xml = data.xml ?? "";
  } finally {
    diagramState.loading = false;
  }
}

/**
 * 重置工作流数据（清空所有流程含自建的模型/定义/实例/历史与关联表单数据，重建初始演示流程）
 */
async function handleResetDemo(): Promise<void> {
  try {
    await ElMessageBox.confirm(
      "将清空所有流程（含用户自建）的模型、发布版本、实例与历史记录，恢复至 4 个初始演示流程。确定重置?",
      "重置工作流数据",
      { confirmButtonText: "重置", cancelButtonText: "取消", type: "warning" }
    );
  } catch {
    ElMessage.info("已取消重置");
    return;
  }
  resetting.value = true;
  try {
    await WorkflowAPI.model.resetDemo();
    ElMessage.success("已重置为初始演示版本");
    fetchData();
  } finally {
    resetting.value = false;
  }
}

/** 是否正在重置演示流程（重置请求期间按钮转圈并防重复点击） */
const resetting = ref(false);

/**
 * 跳转到流程设计器页面
 *
 * @param row 当前模型行
 */
function openDesigner(row: WorkflowModelItem): void {
  router.push({
    name: "WorkflowDesigner",
    query: { modelId: row.id, title: `【${row.name}】流程设计` },
  });
}

/**
 * 删除单个或批量流程（级联删除发布版本、实例与历史，设计草稿一并清除）
 *
 * @param id 指定时删除单个流程；不指定时删除表格勾选项
 */
async function handleDelete(id?: string): Promise<void> {
  const modelIds = id ?? selectedIds.value.join(",");
  if (!modelIds) {
    ElMessage.warning("请勾选删除项");
    return;
  }

  try {
    await ElMessageBox.confirm(
      "将删除该流程的设计、已发布版本及全部流程实例数据，不可恢复。确定删除?",
      "删除流程",
      { confirmButtonText: "删除", cancelButtonText: "取消", type: "warning" }
    );
  } catch {
    ElMessage.info("已取消删除");
    return;
  }

  loading.value = true;
  try {
    await WorkflowAPI.model.deleteByIds(modelIds);
    ElMessage.success("删除成功");
    handleResetQuery();
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  handleQuery();
});
</script>

<style lang="scss" scoped>
.workflow-diagram {
  height: 520px;
}

/* 版本号与开关同行排布 */
.publish-version {
  margin-right: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
