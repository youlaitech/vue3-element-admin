<template>
  <div class="page-container">
    <el-card class="page-search" shadow="never">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="关键字" prop="keywords">
          <el-input
            v-model="queryParams.keywords"
            placeholder="部门名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item label="部门状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 100px">
            <el-option :value="CommonStatus.ENABLED" label="正常" />
            <el-option :value="CommonStatus.DISABLED" label="禁用" />
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
          <el-button v-hasPerm="['sys:dept:create']" type="primary" @click="openDialog()">
            新增
          </el-button>
          <el-button
            v-hasPerm="['sys:dept:delete']"
            type="danger"
            :disabled="!hasSelection"
            @click="handleDelete()"
          >
            删除
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
          row-key="id"
          default-expand-all
          border
          height="100%"
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column prop="name" label="部门名称" min-width="200" />
          <el-table-column prop="code" label="部门编号" width="200" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag v-if="scope.row.status === CommonStatus.ENABLED" type="success">正常</el-tag>
              <el-tag v-else type="info">禁用</el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="sort" label="排序" width="100" />

          <el-table-column label="操作" fixed="right" align="left" width="200">
            <template #default="scope">
              <el-button
                v-hasPerm="['sys:dept:create']"
                type="primary"
                link
                size="small"
                @click.stop="openDialog(scope.row.id, undefined)"
              >
                新增
              </el-button>
              <el-button
                v-hasPerm="['sys:dept:update']"
                type="primary"
                link
                size="small"
                @click.stop="openDialog(scope.row.parentId, scope.row.id)"
              >
                编辑
              </el-button>
              <el-button
                v-hasPerm="['sys:dept:delete']"
                type="danger"
                link
                size="small"
                @click.stop="handleDelete(scope.row.id)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <el-dialog
      v-model="dialogState.visible"
      :title="dialogState.title"
      width="600px"
      @closed="closeDialog"
    >
      <el-form ref="deptFormRef" :model="formData" :rules="rules" label-width="80px">
        <el-form-item label="上级部门" prop="parentId">
          <el-tree-select
            v-model="formData.parentId"
            placeholder="选择上级部门"
            :data="deptOptions"
            filterable
            check-strictly
            :render-after-expand="false"
          />
        </el-form-item>
        <el-form-item label="部门名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入部门名称" />
        </el-form-item>
        <el-form-item label="部门编号" prop="code">
          <el-input v-model="formData.code" placeholder="请输入部门编码" />
        </el-form-item>
        <el-form-item label="显示排序" prop="sort">
          <el-input-number
            v-model="formData.sort"
            controls-position="right"
            style="width: 100px"
            :min="0"
          />
        </el-form-item>
        <el-form-item label="部门状态">
          <el-radio-group v-model="formData.status">
            <el-radio :value="CommonStatus.ENABLED">正常</el-radio>
            <el-radio :value="CommonStatus.DISABLED">禁用</el-radio>
          </el-radio-group>
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
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus";
import { Refresh, FullScreen } from "@element-plus/icons-vue";

import DeptAPI from "@/api/system/dept";
import type { DeptForm, DeptItem, DeptQueryParams } from "@/api/system/dept";
import type { OptionItem } from "@/api/common";
import { useTableSelection } from "@/composables";
import { CommonStatus } from "@/enums";

defineOptions({
  name: "Dept",
  inheritAttrs: false,
});

const tableWrapperRef = ref<HTMLElement | null>(null);
const { toggle: toggleFullscreen } = useFullscreen(tableWrapperRef);

const queryFormRef = ref<FormInstance>();
const deptFormRef = ref<FormInstance>();

const loading = ref(false);
const list = ref<DeptItem[]>([]);
const queryParams = reactive<DeptQueryParams>({
  keywords: "",
  status: undefined,
});

const { selectedIds, hasSelection, handleSelectionChange } = useTableSelection<DeptItem>();

const dialogState = reactive({
  title: "",
  visible: false,
});

const deptOptions = ref<OptionItem[]>([]);

const initialFormData: DeptForm = {
  status: CommonStatus.ENABLED,
  parentId: "0",
  sort: 1,
};

const formData = reactive<DeptForm>({ ...initialFormData });

const rules: FormRules<DeptForm> = {
  parentId: [{ required: true, message: "上级部门不能为空", trigger: "change" }],
  name: [{ required: true, message: "部门名称不能为空", trigger: "blur" }],
  code: [{ required: true, message: "部门编号不能为空", trigger: "blur" }],
  sort: [{ required: true, message: "显示排序不能为空", trigger: "blur" }],
};

/**
 * 拉取部门列表数据（一次性返回全量树）
 */
async function fetchData(): Promise<void> {
  loading.value = true;
  try {
    list.value = await DeptAPI.getList(queryParams);
  } finally {
    loading.value = false;
  }
}

/**
 * 按当前筛选条件重新查询。
 */
function handleQuery(): void {
  fetchData();
}

/**
 * 重置搜索表单后重新查询
 */
function handleResetQuery(): void {
  queryFormRef.value?.resetFields();
  fetchData();
}

/**
 * 重置表单数据和验证状态
 */
function resetForm(): void {
  deptFormRef.value?.resetFields();
  deptFormRef.value?.clearValidate();
  Object.keys(formData).forEach((key) => {
    delete (formData as Record<string, unknown>)[key];
  });
  Object.assign(formData, initialFormData);
}

/**
 * 打开新增/编辑部门弹窗。
 *
 * @param parentId 父部门 ID（新增子部门时传入）
 * @param deptId 部门 ID（编辑时传入）
 */
async function openDialog(parentId?: string, deptId?: string): Promise<void> {
  const data = await DeptAPI.getOptions();
  deptOptions.value = [
    {
      value: "0",
      label: "顶级部门",
      children: data,
    },
  ];

  dialogState.visible = true;
  if (deptId) {
    dialogState.title = "修改部门";
    const form = await DeptAPI.getFormData(deptId);
    Object.assign(formData, form);
  } else {
    dialogState.title = "新增部门";
    formData.parentId = parentId || "0";
  }
}

/**
 * 校验并提交部门表单。
 */
async function handleSubmit(): Promise<void> {
  const valid = await deptFormRef.value?.validate().then(
    () => true,
    () => false
  );
  if (!valid) return;

  loading.value = true;
  try {
    const deptId = formData.id;
    if (deptId) {
      await DeptAPI.update(deptId, formData);
      ElMessage.success("修改成功");
    } else {
      await DeptAPI.create(formData);
      ElMessage.success("新增成功");
    }
    closeDialog();
    fetchData();
  } finally {
    loading.value = false;
  }
}

/**
 * 删除单个或批量部门。
 *
 * @param deptId 指定时删除单个部门；不指定时删除表格勾选项
 */
async function handleDelete(deptId?: string): Promise<void> {
  const deptIds = deptId ?? selectedIds.value.join(",");
  if (!deptIds) {
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
    await DeptAPI.deleteByIds(deptIds);
    ElMessage.success("删除成功");
    handleResetQuery();
  } finally {
    loading.value = false;
  }
}

/**
 * 关闭弹窗并重置表单
 */
function closeDialog(): void {
  dialogState.visible = false;
  resetForm();
}

onMounted(() => {
  fetchData();
});
</script>
