<template>
  <div class="page-container">
    <el-card class="page-search" shadow="never">
      <el-form ref="queryFormRef" :model="params" :inline="true">
        <el-form-item label="关键字" prop="keywords">
          <el-input
            v-model="params.keywords"
            placeholder="应用名称/编码/AppId"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item label="平台" prop="platform">
          <el-select v-model="params.platform" placeholder="全部" clearable style="width: 140px">
            <el-option
              v-for="item in platformOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-select v-model="params.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="正常" :value="CommonStatus.ENABLED" />
            <el-option label="禁用" :value="CommonStatus.DISABLED" />
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
          <el-button v-hasPerm="['sys:app:create']" type="primary" @click="handleCreateClick">
            新增
          </el-button>
          <el-button
            v-hasPerm="['sys:app:delete']"
            type="danger"
            :disabled="!hasSelection"
            @click="handleBatchDelete"
          >
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
          ref="dataTableRef"
          v-loading="loading"
          class="page-table"
          :data="list"
          height="100%"
          border
          highlight-current-row
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column key="appName" label="应用名称" prop="appName" min-width="140" />
          <el-table-column key="appCode" label="应用编码" prop="appCode" min-width="120" />
          <el-table-column key="platform" label="平台" width="130" align="center">
            <template #default="scope">
              <el-tag>{{ resolvePlatformLabel(scope.row.platform) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column key="appId" label="AppId" prop="appId" min-width="160" />
          <el-table-column label="状态" width="90" align="center">
            <template #default="scope">
              <el-switch
                v-model="scope.row.status"
                v-hasPerm="['sys:app:change-status']"
                :active-value="CommonStatus.ENABLED"
                :inactive-value="CommonStatus.DISABLED"
                @change="handleStatusChange(scope.row as AppItem)"
              />
            </template>
          </el-table-column>
          <el-table-column
            key="remark"
            label="备注"
            prop="remark"
            min-width="160"
            show-overflow-tooltip
          />
          <el-table-column key="createTime" label="创建时间" prop="createTime" width="160" />
          <el-table-column fixed="right" label="操作" width="180">
            <template #default="scope">
              <el-button
                v-hasPerm="['sys:app:update']"
                type="primary"
                size="small"
                link
                @click="handleEditClick(String(scope.row.id))"
              >
                编辑
              </el-button>
              <el-button
                v-hasPerm="['sys:app:delete']"
                type="danger"
                size="small"
                link
                @click="handleDelete(String(scope.row.id))"
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
        class="page-pagination"
        @pagination="fetchData"
      />
    </el-card>

    <el-dialog v-model="dialog.visible" :title="dialog.title" width="640px" @close="closeDialog">
      <el-form ref="dataFormRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="应用名称" prop="appName">
          <el-input v-model="formData.appName" placeholder="请输入应用名称" :maxlength="100" />
        </el-form-item>

        <el-form-item label="应用编码" prop="appCode">
          <el-input v-model="formData.appCode" placeholder="请输入应用编码" :maxlength="100" />
        </el-form-item>

        <el-form-item label="平台" prop="platform">
          <el-select v-model="formData.platform" placeholder="请选择平台" style="width: 100%">
            <el-option
              v-for="item in platformOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="AppId" prop="appId">
          <el-input v-model="formData.appId" placeholder="请输入微信/平台 AppId" :maxlength="64" />
        </el-form-item>

        <el-form-item label="AppSecret" prop="appSecret">
          <el-input
            v-model="formData.appSecret"
            placeholder="请输入 AppSecret（可选）"
            :maxlength="256"
            show-password
          />
        </el-form-item>

        <el-form-item label="商户号" prop="merchantId">
          <el-input
            v-model="formData.merchantId"
            placeholder="请输入商户号（可选）"
            :maxlength="64"
          />
        </el-form-item>

        <el-form-item label="商户密钥" prop="merchantKey">
          <el-input
            v-model="formData.merchantKey"
            placeholder="请输入商户密钥（可选）"
            :maxlength="512"
            show-password
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :value="CommonStatus.ENABLED">正常</el-radio>
            <el-radio :value="CommonStatus.DISABLED">禁用</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="formData.remark"
            :rows="3"
            :maxlength="255"
            show-word-limit
            type="textarea"
            placeholder="请输入备注（可选）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">确定</el-button>
          <el-button @click="closeDialog">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { useFullscreen } from "@vueuse/core";
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus";
import { FullScreen, Refresh } from "@element-plus/icons-vue";
import { usePageTable, useTableSelection } from "@/composables";
import AppAPI from "@/api/system/app";
import type { AppItem, AppForm, AppQueryParams, AppPlatform } from "@/api/system/app";
import { CommonStatus } from "@/enums";

defineOptions({
  name: "App",
  inheritAttrs: false,
});

const queryFormRef = ref<FormInstance>();
const dataFormRef = ref<FormInstance>();
const tableWrapperRef = ref<HTMLElement | null>(null);
const { toggle: toggleFullscreen } = useFullscreen(tableWrapperRef);

/** 三方平台下拉选项 */
const platformOptions: Array<{ value: AppPlatform; label: string }> = [
  { value: "WECHAT_MP", label: "微信公众号" },
  { value: "WECHAT_MINI", label: "微信小程序" },
  { value: "ALIPAY", label: "支付宝" },
  { value: "APPLE", label: "苹果" },
  { value: "QQ", label: "QQ" },
];

/** 根据平台值解析中文名称。 */
function resolvePlatformLabel(platform?: string): string {
  return platformOptions.find((item) => item.value === platform)?.label || "-";
}

const initialFormData: AppForm = {
  appName: "",
  appCode: "",
  platform: "WECHAT_MINI",
  appId: "",
  appSecret: "",
  merchantId: "",
  merchantKey: "",
  status: CommonStatus.ENABLED,
  remark: "",
};

/** 应用表格数据 */
const { loading, list, total, params, fetchData, handleQuery, handleResetQuery } = usePageTable<
  AppItem,
  AppQueryParams
>({
  initialParams: {
    pageNum: 1,
    pageSize: 10,
    keywords: "",
    status: undefined,
    platform: undefined,
  },
  request: AppAPI.getPage,
  onBeforeReset: () => queryFormRef.value?.resetFields(),
});

const { selectedIds, hasSelection, handleSelectionChange } = useTableSelection<AppItem>();

const dialog = reactive({
  title: "",
  visible: false,
});

const formData = reactive<AppForm>({ ...initialFormData });

const rules: FormRules<AppForm> = {
  appName: [{ required: true, message: "请输入应用名称", trigger: "blur" }],
  appCode: [{ required: true, message: "请输入应用编码", trigger: "blur" }],
  platform: [{ required: true, message: "请选择平台", trigger: "change" }],
  appId: [{ required: true, message: "请输入 AppId", trigger: "blur" }],
};

/** 关闭弹窗并重置表单 */
function closeDialog(): void {
  dialog.visible = false;
  resetForm();
}

/** 重置表单数据为初始值并清理校验 */
function resetForm(): void {
  dataFormRef.value?.resetFields();
  dataFormRef.value?.clearValidate();
  Object.keys(formData).forEach((key) => {
    delete (formData as Record<string, unknown>)[key];
  });
  Object.assign(formData, initialFormData);
}

/** 打开新增弹窗 */
function handleCreateClick(): void {
  dialog.title = "新增应用";
  dialog.visible = true;
}

/** 打开编辑弹窗并回填数据 */
async function handleEditClick(id: string): Promise<void> {
  dialog.title = "修改应用";
  const data = await AppAPI.getFormData(id);
  Object.assign(formData, data);
  dialog.visible = true;
}

/** 切换应用状态 */
async function handleStatusChange(row: AppItem): Promise<void> {
  const id = String(row.id);
  const status = row.status as number;
  try {
    await AppAPI.updateStatus(id, status);
    ElMessage.success("状态已更新");
  } catch {
    row.status = status === CommonStatus.ENABLED ? CommonStatus.DISABLED : CommonStatus.ENABLED;
  }
}

/** 提交应用表单 */
async function handleSubmit(): Promise<void> {
  const valid = await dataFormRef.value?.validate().then(
    () => true,
    () => false
  );
  if (!valid) return;

  loading.value = true;
  try {
    const id = formData.id;
    if (id) {
      await AppAPI.update(id, formData);
      ElMessage.success("修改成功");
    } else {
      await AppAPI.create(formData);
      ElMessage.success("新增成功");
    }
    closeDialog();
    handleResetQuery();
  } finally {
    loading.value = false;
  }
}

/** 批量删除应用 */
function handleBatchDelete(): void {
  handleDelete();
}

/** 删除应用（单个或批量） */
async function handleDelete(id?: string): Promise<void> {
  const ids = id || selectedIds.value.join(",");
  if (!ids) {
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
    await AppAPI.deleteByIds(ids);
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
