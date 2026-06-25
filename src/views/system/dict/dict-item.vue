<template>
  <div class="page-container">
    <el-card ref="tableWrapperRef" class="page-search" shadow="never">
      <el-form ref="queryFormRef" :model="params" :inline="true">
        <el-form-item label="关键字" prop="keywords">
          <el-input
            v-model="params.keywords"
            placeholder="字典标签/字典值"
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

    <el-card class="page-content" shadow="never">
      <div class="page-toolbar">
        <div class="page-toolbar__left">
          <el-button type="primary" @click="handleCreateClick()">新增</el-button>
          <el-button type="danger" :disabled="!hasSelection" @click="handleBatchDelete()">
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
          <el-table-column label="字典项标签" prop="label" />
          <el-table-column label="字典项值" prop="value" />
          <el-table-column label="排序" prop="sort" />
          <el-table-column label="状态">
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
                @click.stop="handleEditClick(scope.row as DictItem)"
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
      width="600px"
      @close="closeDialog"
    >
      <el-form ref="dictItemFormRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="字典项标签" prop="label">
          <el-input v-model="formData.label" placeholder="请输入字典标签" />
        </el-form-item>
        <el-form-item label="字典项值" prop="value">
          <el-input v-model="formData.value" placeholder="请输入字典值" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="formData.status">
            <el-radio :value="CommonStatus.ENABLED">启用</el-radio>
            <el-radio :value="CommonStatus.DISABLED">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="formData.sort" controls-position="right" />
        </el-form-item>
        <el-form-item>
          <template #label>
            <div class="flex-y-center">
              标签类型
              <el-tooltip>
                <template #content>回显样式，为空时则显示 '文本'</template>
                <el-icon class="ml-1 cursor-pointer">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
          <el-select
            v-model="formData.tagType"
            placeholder="请选择标签类型"
            clearable
            @clear="formData.tagType = ''"
          >
            <template #label="{ value }">
              <el-tag v-if="value" :type="value">
                {{ formData.label ? formData.label : "字典标签" }}
              </el-tag>
            </template>
            <el-option v-for="type in tagTypeOptions" :key="type" :label="type" :value="type">
              <div flex-y-center gap-10px>
                <el-tag :type="type as any">{{ formData.label ?? "字典标签" }}</el-tag>
                <span>{{ type }}</span>
              </div>
            </el-option>
          </el-select>
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
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus";
import { FullScreen, QuestionFilled, Refresh } from "@element-plus/icons-vue";

import DictAPI from "@/api/system/dict";
import type { DictItem, DictItemForm, DictItemQueryParams } from "@/api/system/dict";
import { usePageTable, useTableSelection } from "@/composables";
import { CommonStatus } from "@/enums";

defineOptions({
  name: "DictItem",
  inheritAttrs: false,
});

const route = useRoute();

// 当前字典编码，由路由 query 传入。
const dictCode = ref(String(route.query.dictCode ?? ""));

const tableWrapperRef = ref<HTMLElement | null>(null);
const { toggle: toggleFullscreen } = useFullscreen(tableWrapperRef);

const queryFormRef = ref<FormInstance>();
const dictItemFormRef = ref<FormInstance>();

// 标签类型可选项。
const tagTypeOptions: NonNullable<DictItemForm["tagType"]>[] = [
  "primary",
  "success",
  "info",
  "warning",
  "danger",
];

/** 分页表格数据管理 */
const { loading, list, total, params, fetchData, handleQuery, handleResetQuery } = usePageTable<
  DictItem,
  DictItemQueryParams
>({
  initialParams: {
    pageNum: 1,
    pageSize: 10,
    dictCode: dictCode.value,
    keywords: "",
  },
  request: (query) => DictAPI.getDictItemPage(dictCode.value, query),
  onBeforeReset: () => queryFormRef.value?.resetFields(),
});

const { selectedIds, hasSelection, handleSelectionChange } = useTableSelection<DictItem>();

const dialogState = reactive({
  title: "",
  visible: false,
});

const initialFormData: DictItemForm = {
  dictCode: dictCode.value,
  sort: 1,
  status: CommonStatus.ENABLED,
  tagType: "",
};

const formData = reactive<DictItemForm>({ ...initialFormData });

const rules: FormRules<DictItemForm> = {
  value: [{ required: true, message: "请输入字典值", trigger: "blur" }],
  label: [{ required: true, message: "请输入字典标签", trigger: "blur" }],
};

/**
 * 重置表单数据和验证状态
 */
function resetForm(): void {
  dictItemFormRef.value?.resetFields();
  dictItemFormRef.value?.clearValidate();
  Object.keys(formData).forEach((key) => {
    delete (formData as Record<string, unknown>)[key];
  });
  Object.assign(formData, initialFormData);
}

/**
 * 打开表单弹窗。
 */
function openDialog(): void {
  dialogState.visible = true;
}

/**
 * 关闭表单弹窗并清理临时状态
 */
function closeDialog(): void {
  dialogState.visible = false;
  resetForm();
}

/**
 * 打开新增字典项弹窗
 */
function handleCreateClick(): void {
  dialogState.title = "新增字典项";
  openDialog();
}

/**
 * 打开编辑字典项弹窗并回填数据
 *
 * @param row 当前字典项行
 */
async function handleEditClick(row: DictItem): Promise<void> {
  if (!row.id) return;
  dialogState.title = "编辑字典值";
  const data = await DictAPI.getDictItemFormData(dictCode.value, row.id);
  Object.assign(formData, data);
  openDialog();
}

/**
 * 校验并提交字典项表单。
 */
async function handleSubmit(): Promise<void> {
  const valid = await dictItemFormRef.value?.validate().then(
    () => true,
    () => false
  );
  if (!valid) return;

  formData.dictCode = dictCode.value;
  const id = formData.id;

  loading.value = true;
  try {
    if (id) {
      await DictAPI.updateDictItem(dictCode.value, id, formData);
      ElMessage.success("修改成功");
    } else {
      await DictAPI.createDictItem(dictCode.value, formData);
      ElMessage.success("新增成功");
    }
    closeDialog();
    handleQuery();
  } finally {
    loading.value = false;
  }
}

/**
 * 删除单个或批量字典项。
 *
 * @param id 指定时删除单个字典项；不指定时删除表格勾选项
 */
async function handleDelete(id?: string): Promise<void> {
  const itemIds = id ?? selectedIds.value.join(",");
  if (!itemIds) {
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
    await DictAPI.deleteDictItems(dictCode.value, itemIds);
    ElMessage.success("删除成功");
    handleResetQuery();
  } finally {
    loading.value = false;
  }
}

/**
 * 批量删除当前勾选字典项
 */
function handleBatchDelete(): void {
  handleDelete();
}

onMounted(() => {
  handleQuery();
});
</script>
