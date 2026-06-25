<template>
  <div class="page-container">
    <el-card class="page-search" shadow="never">
      <el-form ref="queryFormRef" :model="params" :inline="true">
        <el-form-item label="关键字" prop="keywords">
          <el-input
            v-model="params.keywords"
            placeholder="字典名称/编码"
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
          <el-table-column label="字典名称" prop="name" />
          <el-table-column label="字典编码" prop="dictCode" />
          <el-table-column label="状态" prop="status">
            <template #default="scope">
              <el-tag :type="scope.row.status === CommonStatus.ENABLED ? 'success' : 'info'">
                {{ scope.row.status === CommonStatus.ENABLED ? "启用" : "禁用" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" align="center" width="220">
            <template #default="scope">
              <el-button
                type="primary"
                link
                size="small"
                @click.stop="openDictData(scope.row as any)"
              >
                字典数据
              </el-button>

              <el-button
                type="primary"
                link
                size="small"
                @click.stop="handleEditClick(scope.row.id)"
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
      width="500px"
      @close="closeDialog"
    >
      <el-form ref="dictFormRef" :model="formData" :rules="rules" label-width="80px">
        <el-form-item label="字典名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入字典名称" />
        </el-form-item>

        <el-form-item label="字典编码" prop="dictCode">
          <el-input v-model="formData.dictCode" placeholder="请输入字典编码" />
        </el-form-item>

        <el-form-item label="状态">
          <el-radio-group v-model="formData.status">
            <el-radio :value="CommonStatus.ENABLED">启用</el-radio>
            <el-radio :value="CommonStatus.DISABLED">禁用</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="备注">
          <el-input v-model="formData.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
          <el-button @click="closeDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { useFullscreen } from "@vueuse/core";
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus";
import { Refresh } from "@element-plus/icons-vue";

import DictAPI from "@/api/system/dict";
import type { DictTypeForm, DictTypeItem, DictTypeQueryParams } from "@/api/system/dict";
import router from "@/router";
import { usePageTable, useTableSelection } from "@/composables";
import { CommonStatus } from "@/enums";

defineOptions({
  name: "Dict",
  inheritAttrs: false,
});

const tableWrapperRef = ref<HTMLElement | null>(null);
const { toggle: toggleFullscreen } = useFullscreen(tableWrapperRef);

const queryFormRef = ref<FormInstance>();
const dictFormRef = ref<FormInstance>();

/** 分页表格数据管理 */
const { loading, list, total, params, fetchData, handleQuery, handleResetQuery } = usePageTable<
  DictTypeItem,
  DictTypeQueryParams
>({
  initialParams: {
    pageNum: 1,
    pageSize: 10,
    keywords: "",
  },
  request: DictAPI.getPage,
  onBeforeReset: () => queryFormRef.value?.resetFields(),
});

const { selectedIds, hasSelection, handleSelectionChange } = useTableSelection<DictTypeItem>();

const dialogState = reactive({
  title: "",
  visible: false,
});

const initialFormData: DictTypeForm = {
  status: CommonStatus.ENABLED,
};

const formData = reactive<DictTypeForm>({ ...initialFormData });

const rules: FormRules<DictTypeForm> = {
  name: [{ required: true, message: "请输入字典名称", trigger: "blur" }],
  dictCode: [{ required: true, message: "请输入字典编码", trigger: "blur" }],
};

/**
 * 重置表单数据和验证状态
 */
function resetForm(): void {
  dictFormRef.value?.resetFields();
  dictFormRef.value?.clearValidate();
  Object.keys(formData).forEach((key) => {
    delete (formData as Record<string, unknown>)[key];
  });
  Object.assign(formData, initialFormData);
}

function openDialog(): void {
  dialogState.visible = true;
}

/**
 * 关闭字典表单弹窗并清理临时状态
 */
function closeDialog(): void {
  dialogState.visible = false;
  resetForm();
}

/**
 * 打开新增字典弹窗
 */
function handleCreateClick(): void {
  resetForm();
  dialogState.title = "新增字典";
  openDialog();
}

/**
 * 打开编辑字典弹窗并回填数据
 *
 * @param id 字典 ID
 */
async function handleEditClick(id: string): Promise<void> {
  resetForm();
  dialogState.title = "修改字典";
  const data = await DictAPI.getFormData(id);
  Object.assign(formData, data);
  openDialog();
}

/**
 * 校验并提交字典表单
 */
async function handleSubmit(): Promise<void> {
  const valid = await dictFormRef.value?.validate().then(
    () => true,
    () => false
  );
  if (!valid) return;

  loading.value = true;
  try {
    const id = formData.id;
    if (id) {
      await DictAPI.update(id, formData);
      ElMessage.success("修改成功");
    } else {
      await DictAPI.create(formData);
      ElMessage.success("新增成功");
    }
    closeDialog();
    handleQuery();
  } finally {
    loading.value = false;
  }
}

/**
 * 删除单个或批量字典
 *
 * @param id 指定时删除单个字典；不指定时删除表格勾选项
 */
async function handleDelete(id?: string): Promise<void> {
  const dictIds = id ?? selectedIds.value.join(",");
  if (!dictIds) {
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
    await DictAPI.deleteByIds(dictIds);
    ElMessage.success("删除成功");
    handleResetQuery();
  } finally {
    loading.value = false;
  }
}

/**
 * 跳转到字典项管理页面
 *
 * 检查路由是否已注册后再跳转
 *
 * @param row 当前字典行
 */
function openDictData(row: DictTypeItem): void {
  try {
    const route = router.resolve({
      name: "DictItem",
      query: { dictCode: row.dictCode, title: `【${row.name}】字典数据` },
    });
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

onMounted(() => {
  handleQuery();
});
</script>
