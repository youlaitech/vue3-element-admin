<template>
  <div class="page-container">
    <el-card class="page-search" shadow="never">
      <el-form ref="queryFormRef" :model="params" :inline="true">
        <el-form-item label="关键字" prop="keywords">
          <el-input
            v-model="params.keywords"
            placeholder="请输入配置键\配置名称"
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
            v-hasPerm="['sys:config:create']"
            type="primary"
            :disabled="isSaving || deletingId !== undefined"
            @click="openDialog()"
          >
            新增
          </el-button>
          <el-button v-hasPerm="['sys:config:refresh']" type="warning" @click="refreshCache">
            刷新缓存
          </el-button>
        </div>
        <div class="page-toolbar__right">
          <el-tooltip content="刷新" placement="top">
            <el-button class="page-icon-btn" @click="handleQuery">
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
          :data="list"
          class="page-table"
          height="100%"
          highlight-current-row
          border
        >
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column key="configName" label="配置名称" prop="configName" min-width="100" />
          <el-table-column key="configKey" label="配置键" prop="configKey" min-width="100" />
          <el-table-column key="configValue" label="配置值" prop="configValue" min-width="100" />
          <el-table-column key="remark" label="描述" prop="remark" min-width="100" />
          <el-table-column fixed="right" label="操作" width="220">
            <template #default="scope">
              <el-button
                v-hasPerm="['sys:config:update']"
                type="primary"
                size="small"
                link
                :disabled="isSaving || deletingId !== undefined"
                @click="openDialog(scope.row.id)"
              >
                编辑
              </el-button>
              <el-button
                v-hasPerm="['sys:config:delete']"
                type="danger"
                size="small"
                link
                :loading="deletingId === scope.row.id"
                :disabled="isSaving || deletingId !== undefined"
                @click="handleDelete(scope.row.id)"
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
      width="500px"
      :close-on-click-modal="!isSaving"
      :close-on-press-escape="!isSaving"
      :show-close="!isSaving"
      @close="closeDialog"
    >
      <el-alert
        v-if="hasFormLoadError"
        title="配置详情加载失败，请重新打开。"
        type="error"
        :closable="false"
      />
      <el-form
        ref="dataFormRef"
        v-loading="isLoadingForm"
        :model="formData"
        :rules="rules"
        :disabled="isLoadingForm || hasFormLoadError || isSaving"
        label-suffix=":"
        label-width="100px"
      >
        <el-form-item label="配置名称" prop="configName">
          <el-input v-model="formData.configName" placeholder="请输入配置名称" :maxlength="50" />
        </el-form-item>
        <el-form-item label="配置键" prop="configKey">
          <el-input v-model="formData.configKey" placeholder="请输入配置键" :maxlength="50" />
        </el-form-item>
        <el-form-item label="配置值" prop="configValue">
          <el-input v-model="formData.configValue" placeholder="请输入配置值" :maxlength="100" />
        </el-form-item>
        <el-form-item label="描述" prop="remark">
          <el-input
            v-model="formData.remark"
            :rows="4"
            :maxlength="100"
            show-word-limit
            type="textarea"
            placeholder="请输入描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button
            type="primary"
            :loading="isSaving"
            :disabled="isLoadingForm || hasFormLoadError"
            @click="handleSubmit"
          >
            确定
          </el-button>
          <el-button :disabled="isSaving" @click="closeDialog">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus";
import { Refresh, FullScreen } from "@element-plus/icons-vue";

import ConfigAPI from "@/api/system/config";
import type { ConfigItem, ConfigForm, ConfigQuery } from "@/api/system/config";
import { usePageTable } from "@/composables";

defineOptions({
  name: "Config",
  inheritAttrs: false,
});

const tableWrapperRef = ref<HTMLElement | null>(null);
const { toggle: toggleFullscreen } = useFullscreen(tableWrapperRef);

const queryFormRef = ref<FormInstance>();
const dataFormRef = ref<FormInstance>();

// 分页表格数据管理
const { loading, list, total, params, fetchData, handleQuery, handleResetQuery } = usePageTable<
  ConfigItem,
  ConfigQuery
>({
  initialParams: { pageNum: 1, pageSize: 10, keywords: "" },
  request: ConfigAPI.getPage,
  onBeforeReset: () => queryFormRef.value?.resetFields(),
});

const dialogState = reactive({ title: "", visible: false });
const isLoadingForm = ref(false);
const hasFormLoadError = ref(false);
const isSaving = ref(false);
const deletingId = ref<string>();
let formRevision = 0;

const initialFormData: ConfigForm = {
  id: undefined,
  configName: "",
  configKey: "",
  configValue: "",
  remark: "",
};
const formData = reactive<ConfigForm>({ ...initialFormData });

const rules: FormRules = {
  configName: [{ required: true, message: "请输入系统配置名称", trigger: "blur" }],
  configKey: [{ required: true, message: "请输入系统配置编码", trigger: "blur" }],
  configValue: [{ required: true, message: "请输入系统配置值", trigger: "blur" }],
};

/**
 * 打开配置表单，仅回填当前记录的最新详情。
 */
async function openDialog(id?: string): Promise<void> {
  if (isSaving.value || deletingId.value !== undefined) return;
  const revision = ++formRevision;
  Object.assign(formData, initialFormData);
  dataFormRef.value?.clearValidate();
  hasFormLoadError.value = false;
  isLoadingForm.value = id !== undefined;
  dialogState.title = id === undefined ? "新增系统配置" : "修改系统配置";
  dialogState.visible = true;

  if (id === undefined) return;
  try {
    const data = await ConfigAPI.getFormData(id);
    if (revision === formRevision) Object.assign(formData, data, { id });
  } catch {
    if (revision === formRevision) hasFormLoadError.value = true;
  } finally {
    if (revision === formRevision) isLoadingForm.value = false;
  }
}

// 刷新缓存
const refreshCache = useDebounceFn(async () => {
  await ConfigAPI.refreshCache();
  ElMessage.success("刷新成功");
}, 1000);

/**
 * 校验并提交系统配置表单
 */
async function handleSubmit(): Promise<void> {
  if (isSaving.value || isLoadingForm.value || hasFormLoadError.value || !dialogState.visible)
    return;
  const revision = formRevision;
  isSaving.value = true;
  try {
    const valid = await dataFormRef.value?.validate().catch(() => false);
    if (!valid || revision !== formRevision) return;

    const data = { ...formData };
    const id = data.id;
    if (id) {
      await ConfigAPI.update(id, data);
      ElMessage.success("修改成功");
    } else {
      await ConfigAPI.create(data);
      ElMessage.success("新增成功");
    }
    closeDialog();
    await handleResetQuery().catch(() => undefined);
  } finally {
    isSaving.value = false;
  }
}

/**
 * 关闭弹窗并重置表单
 */
function closeDialog(): void {
  formRevision += 1;
  dialogState.visible = false;
  isLoadingForm.value = false;
  hasFormLoadError.value = false;
  Object.assign(formData, initialFormData);
  dataFormRef.value?.clearValidate();
}

/**
 * 删除系统配置
 */
async function handleDelete(id: string): Promise<void> {
  if (isSaving.value || deletingId.value !== undefined) return;
  deletingId.value = id;
  try {
    const confirmed = await ElMessageBox.confirm("确认删除该项配置?", "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }).then(
      () => true,
      () => false
    );
    if (!confirmed) return;

    await ConfigAPI.deleteById(id);
    ElMessage.success("删除成功");
    await handleResetQuery().catch(() => undefined);
  } finally {
    deletingId.value = undefined;
  }
}

onScopeDispose(() => {
  formRevision += 1;
});

onMounted(() => {
  handleQuery();
});
</script>
