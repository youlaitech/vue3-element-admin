<template>
  <div class="page-container">
    <el-card class="page-search" shadow="never">
      <el-form ref="queryFormRef" :model="params" :inline="true">
        <el-form-item label="关键字" prop="keywords">
          <el-input
            v-model="params.keywords"
            placeholder="表单名称/标识"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-select v-model="params.status" placeholder="全部" clearable class="!w-[160px]">
            <el-option
              v-for="(label, value) in statusOptions"
              :key="value"
              :label="label"
              :value="Number(value)"
            />
          </el-select>
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
          <!-- 类型过滤：空串=全部，切换即查询 -->
          <el-radio-group v-model="params.category" @change="handleQuery">
            <el-radio-button value="">全部</el-radio-button>
            <el-radio-button v-for="(label, value) in categoryOptions" :key="value" :value="value">
              {{ label }}
            </el-radio-button>
          </el-radio-group>
          <el-button type="primary" @click="handleCreateClick()">新增</el-button>
          <el-button type="danger" :disabled="!hasSelection" @click="handleDelete()">
            删除
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
          <el-table-column label="表单名称" prop="formName" min-width="180" show-overflow-tooltip>
            <template #default="scope">
              <span class="form-name">
                <span class="form-name__text">{{ scope.row.formName }}</span>
                <!-- 类型标签仅"全部"视图标注例外（工作流），避免与分段过滤重复 -->
                <el-tag
                  v-if="!params.category && scope.row.category === 'workflow'"
                  size="small"
                  type="success"
                  effect="plain"
                >
                  工作流
                </el-tag>
                <el-tag v-if="scope.row.isPublic === 1" size="small" type="warning" effect="plain">
                  公开
                </el-tag>
              </span>
            </template>
          </el-table-column>
          <el-table-column label="表单标识" prop="formKey" min-width="160" show-overflow-tooltip />
          <el-table-column label="描述" prop="description" min-width="160" show-overflow-tooltip />
          <el-table-column label="状态" width="90" align="center">
            <template #default="scope">
              <el-tag :type="statusTagType(scope.row.status)">
                {{ statusOptions[scope.row.status] ?? "未知" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="版本" prop="version" width="70" align="center" />
          <el-table-column label="创建时间" prop="createTime" width="170" align="center" />
          <el-table-column fixed="right" label="操作" align="center" width="330">
            <template #default="scope">
              <el-button
                type="primary"
                link
                size="small"
                @click.stop="openDesigner(scope.row as FormDefinitionItem)"
              >
                设计
              </el-button>
              <el-button
                v-if="scope.row.status === FormStatus.PUBLISHED"
                type="primary"
                link
                size="small"
                @click.stop="openDataPage(scope.row as FormDefinitionItem)"
              >
                数据
              </el-button>
              <el-button
                type="success"
                link
                size="small"
                @click.stop="openPublishDialog(scope.row as FormDefinitionItem)"
              >
                {{ scope.row.status === FormStatus.PUBLISHED ? "入口管理" : "发布" }}
              </el-button>
              <el-button
                v-if="scope.row.status === FormStatus.PUBLISHED"
                type="warning"
                link
                size="small"
                @click.stop="handleDisable(scope.row.id)"
              >
                停用
              </el-button>
              <el-button
                type="primary"
                link
                size="small"
                @click.stop="handleEditClick(scope.row as FormDefinitionItem)"
              >
                编辑
              </el-button>
              <el-button type="danger" link size="small" @click.stop="handleDelete(scope.row.id)">
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
      <el-form ref="formDefinitionFormRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="表单名称" prop="formName">
          <el-input v-model="formData.formName" placeholder="请输入表单名称" />
        </el-form-item>

        <el-form-item prop="formKey">
          <template #label>
            <div class="flex-y-center">
              表单标识
              <el-tooltip content="创建后不可修改，建议用有业务含义的英文编码" placement="bottom">
                <el-icon class="ml-1 cursor-pointer">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
          <el-input
            v-model="formData.formKey"
            :disabled="!!formData.id"
            placeholder="如 employee_onboarding"
          />
        </el-form-item>

        <el-form-item prop="category">
          <template #label>
            <div class="flex-y-center">
              表单类型
              <el-tooltip
                content="普通表单用于公开收集/菜单挂载；工作流表单可被流程绑定为发起或办理表单"
                placement="bottom"
              >
                <el-icon class="ml-1 cursor-pointer">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
          <el-select
            v-model="formData.category"
            :disabled="!!formData.id && categoryDisabled"
            placeholder="请选择表单类型"
          >
            <el-option
              v-for="(label, value) in categoryOptions"
              :key="value"
              :label="label"
              :value="value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="表单描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入表单描述"
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

    <!-- 发布向导：发布方式 → 入口配置（菜单+角色/公开开关） → 完成汇总 -->
    <FormPublishDialog
      v-model="publishState.visible"
      :form-id="publishState.formId"
      :form-key="publishState.formKey"
      :form-name="publishState.formName"
      :status="publishState.status"
      :is-public="publishState.isPublic"
      @success="handlePublishSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { useFullscreen } from "@vueuse/core";
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus";
import { QuestionFilled, Refresh } from "@element-plus/icons-vue";

import FormAPI from "@/api/form";
import type { FormDefinitionData, FormDefinitionItem, FormDefinitionQueryParams } from "@/api/form";
import router from "@/router";
import { usePageTable, useTableSelection } from "@/composables";
import { FormStatus } from "@/enums";
import FormPublishDialog from "./components/PublishDialog.vue";

defineOptions({
  name: "FormDefinition",
  inheritAttrs: false,
});

const tableWrapperRef = ref<HTMLElement | null>(null);
const { toggle: toggleFullscreen } = useFullscreen(tableWrapperRef);

const queryFormRef = ref<FormInstance>();
const formDefinitionFormRef = ref<FormInstance>();

/** 状态下拉/标签展示映射 */
const statusOptions: Record<number, string> = {
  [FormStatus.DRAFT]: "草稿",
  [FormStatus.PUBLISHED]: "已发布",
  [FormStatus.DISABLED]: "已停用",
};

/** 类型下拉/标签展示映射 */
const categoryOptions: Record<string, string> = {
  normal: "普通表单",
  workflow: "工作流表单",
};

/** 当前编辑表单状态：非草稿（已发布/已停用）时类型作为业务标识不可修改 */
const editingStatus = ref<FormStatus | null>(null);
const categoryDisabled = computed(
  () => editingStatus.value !== null && editingStatus.value !== FormStatus.DRAFT
);

/**
 * 状态标签样式
 *
 * @param status 状态值
 */
function statusTagType(status: number): "info" | "success" | "danger" {
  switch (status) {
    case FormStatus.PUBLISHED:
      return "success";
    case FormStatus.DISABLED:
      return "danger";
    default:
      return "info";
  }
}

/** 分页表格数据管理 */
const { loading, list, total, params, fetchData, handleQuery, handleResetQuery } = usePageTable<
  FormDefinitionItem,
  FormDefinitionQueryParams
>({
  initialParams: {
    pageNum: 1,
    pageSize: 10,
    keywords: "",
    // 类型过滤（空串=全部），与工具栏分段按钮绑定
    category: "",
  },
  request: FormAPI.getPage,
  onBeforeReset: () => queryFormRef.value?.resetFields(),
});

const { selectedIds, hasSelection, handleSelectionChange } =
  useTableSelection<FormDefinitionItem>();

const dialogState = reactive({
  title: "",
  visible: false,
});

/** 新增表单默认值：类型缺省普通表单 */
const initialFormData: FormDefinitionData = {
  category: "normal",
};

const formData = reactive<FormDefinitionData>({ ...initialFormData });

const rules: FormRules<FormDefinitionData> = {
  formName: [{ required: true, message: "请输入表单名称", trigger: "blur" }],
  formKey: [
    { required: true, message: "请输入表单标识", trigger: "blur" },
    {
      pattern: /^[a-z][a-z0-9_]*$/,
      message: "须以小写字母开头，仅含小写字母、数字、下划线",
      trigger: "blur",
    },
  ],
};

// 重置表单数据和校验状态
function resetForm(): void {
  formDefinitionFormRef.value?.resetFields();
  formDefinitionFormRef.value?.clearValidate();
  Object.keys(formData).forEach((key) => {
    delete (formData as Record<string, unknown>)[key];
  });
  Object.assign(formData, initialFormData);
}

function openDialog(): void {
  dialogState.visible = true;
}

// 关闭弹窗并重置
function closeDialog(): void {
  dialogState.visible = false;
  resetForm();
}

// 打开新增弹窗（类型按当前过滤视图预选）
function handleCreateClick(): void {
  resetForm();
  editingStatus.value = null;
  dialogState.title = "新增表单";
  formData.category = params.category === "workflow" ? "workflow" : "normal";
  openDialog();
}

/**
 * 打开编辑弹窗并回填数据
 * @param row 当前表单行（携带状态，判断类型可否修改）
 */
async function handleEditClick(row: FormDefinitionItem): Promise<void> {
  resetForm();
  editingStatus.value = row.status;
  dialogState.title = "修改表单";
  const data = await FormAPI.getFormData(row.id);
  Object.assign(formData, data);
  openDialog();
}

// 校验并提交
async function handleSubmit(): Promise<void> {
  const valid = await formDefinitionFormRef.value?.validate().then(
    () => true,
    () => false
  );
  if (!valid) return;

  loading.value = true;
  try {
    const id = formData.id;
    if (id) {
      // 仅提交元数据：formData 由回显数据整体赋值，含 formJson/optionsJson，
      // 整体回写会用打开弹窗时的旧规则覆盖期间设计器保存的新规则
      const { formKey, formName, category, description } = formData;
      await FormAPI.update(id, { formKey, formName, category, description });
      ElMessage.success("修改成功");
    } else {
      await FormAPI.create(formData);
      ElMessage.success("新增成功");
    }
    closeDialog();
    handleQuery();
  } finally {
    loading.value = false;
  }
}

/** 发布向导状态（发布/入口管理共用） */
const publishState = reactive({
  visible: false,
  formId: "",
  formKey: "",
  formName: "",
  status: 0,
  /** 公开开关回显（分享配置步骤依赖） */
  isPublic: 0,
});

/**
 * 打开发布向导（已发布表单直达入口配置）
 * @param row 当前表单行
 */
function openPublishDialog(row: FormDefinitionItem): void {
  Object.assign(publishState, {
    visible: true,
    formId: row.id,
    formKey: row.formKey,
    formName: row.formName,
    status: row.status,
    isPublic: row.isPublic ?? 0,
  });
}

// 发布后刷新列表（状态与版本可能已变更）
function handlePublishSuccess(): void {
  fetchData();
}

/**
 * 跳转到指定表单页面并检查路由是否已注册
 * @param name 路由名称（FormDesigner/FormData）
 * @param query 路由参数
 */
function openFormPage(name: string, query: Record<string, string>): void {
  try {
    const route = router.resolve({ name, query });
    if (route.matched.length === 0) {
      ElMessage.error("路由未注册，请刷新页面后重试");
      return;
    }
    router.push(route);
  } catch (error) {
    console.error("路由跳转失败:", error);
    ElMessage.error("页面跳转失败，请刷新页面后重试");
  }
}

/**
 * 跳转到表单数据页
 * @param row 当前表单行
 */
function openDataPage(row: FormDefinitionItem): void {
  openFormPage("FormData", { formKey: row.formKey, title: `【${row.formName}】数据` });
}

/**
 * 停用表单（已发出去的访问入口立即失效）
 * @param id 表单 ID
 */
async function handleDisable(id: string): Promise<void> {
  try {
    await ElMessageBox.confirm("停用后表单立即不可访问，已提交数据保留，确定停用?", "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
  } catch {
    ElMessage.info("已取消停用");
    return;
  }
  await FormAPI.disable(id);
  ElMessage.success("已停用");
  fetchData();
}

/**
 * 删除单个或批量表单定义
 * @param id 指定时删除单个表单，否则删除勾选项
 */
async function handleDelete(id?: string): Promise<void> {
  const formIds = id ?? selectedIds.value.join(",");
  if (!formIds) {
    ElMessage.warning("请勾选删除项");
    return;
  }

  try {
    await ElMessageBox.confirm("确认删除已选中的数据项?", "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
  } catch {
    ElMessage.info("已取消删除");
    return;
  }

  loading.value = true;
  try {
    await FormAPI.deleteByIds(formIds);
    ElMessage.success("删除成功");
    handleResetQuery();
  } finally {
    loading.value = false;
  }
}

/**
 * 跳转到表单设计器页面
 * @param row 当前表单行
 */
function openDesigner(row: FormDefinitionItem): void {
  openFormPage("FormDesigner", { id: row.id, title: `【${row.formName}】表单设计` });
}

onMounted(() => {
  handleQuery();
});
</script>

<style scoped>
/* 表单名称 + 公开标签同行展示，避免长名称触发折行 */
.form-name {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  max-width: 100%;

  &__text {
    flex-shrink: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
