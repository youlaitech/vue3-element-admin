<template>
  <div class="page-container">
    <el-card ref="tableWrapperRef" class="page-search" shadow="never">
      <el-form ref="queryFormRef" :model="params" :inline="true">
        <el-form-item label="关键字" prop="keywords">
          <el-input
            v-model="params.keywords"
            placeholder="套餐名称/套餐编码"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-select v-model="params.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="启用" :value="CommonStatus.ENABLED" />
            <el-option label="停用" :value="CommonStatus.DISABLED" />
          </el-select>
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
          <el-button
            v-hasPerm="['sys:tenant-plan:create']"
            type="primary"
            @click="handleCreateClick()"
          >
            新增
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
          :data="list"
          class="page-table"
          height="100%"
          highlight-current-row
          border
        >
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column label="套餐名称" prop="name" min-width="120" />
          <el-table-column label="套餐编码" prop="code" width="160" />
          <el-table-column label="状态" width="100" align="center">
            <template #default="scope">
              <el-tag v-if="scope.row.status === CommonStatus.ENABLED" type="success">启用</el-tag>
              <el-tag v-else type="info">停用</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="排序" prop="sort" width="80" align="center" />
          <el-table-column label="备注" prop="remark" min-width="140" />
          <el-table-column label="创建时间" prop="createTime" width="180" />
          <el-table-column fixed="right" label="操作" width="240">
            <template #default="scope">
              <el-button
                v-hasPerm="['sys:tenant-plan:assign']"
                type="primary"
                size="small"
                link
                icon="menu"
                @click="handleAssignMenuClick(scope.row)"
              >
                菜单配置
              </el-button>
              <el-button
                v-hasPerm="['sys:tenant-plan:update']"
                type="primary"
                size="small"
                link
                @click="handleEditClick(scope.row.id)"
              >
                编辑
              </el-button>
              <el-button
                v-hasPerm="['sys:tenant-plan:delete']"
                type="danger"
                size="small"
                link
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
      width="520px"
      @close="closeDialog"
    >
      <el-form ref="planFormRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="套餐名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入套餐名称" />
        </el-form-item>
        <el-form-item label="套餐编码" prop="code">
          <el-input v-model="formData.code" placeholder="请输入套餐编码" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :value="CommonStatus.ENABLED">启用</el-radio>
            <el-radio :value="CommonStatus.DISABLED">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number
            v-model="formData.sort"
            controls-position="right"
            :min="0"
            style="width: 120px"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="可选" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">确定</el-button>
          <el-button @click="closeDialog">取消</el-button>
        </div>
      </template>
    </el-dialog>

    <el-drawer
      v-model="planMenuDialogVisible"
      :title="'【' + checkedPlan.name + '】菜单配置'"
      size="600px"
      @close="closePlanMenuDialog"
    >
      <div class="flex-x-between">
        <el-input v-model="menuKeywords" clearable class="w-[150px]" placeholder="菜单名称">
          <template #prefix>
            <Search />
          </template>
        </el-input>

        <div class="flex-center ml-5">
          <el-button type="primary" size="small" plain @click="toggleMenuTree">
            <template #icon>
              <Switch />
            </template>
            {{ menuExpanded ? "收缩" : "展开" }}
          </el-button>
          <el-checkbox v-model="menuParentChildLinked" class="ml-5" @change="handleMenuLinkChange">
            父子联动
          </el-checkbox>

          <el-tooltip placement="bottom">
            <template #content>
              如果只需勾选菜单权限，不需要勾选子菜单或者按钮权限，请关闭父子联动
            </template>
            <el-icon class="ml-1 color-[--el-color-primary] inline-block cursor-pointer">
              <QuestionFilled />
            </el-icon>
          </el-tooltip>
        </div>
      </div>

      <el-tree
        ref="menuTreeRef"
        node-key="value"
        show-checkbox
        :data="menuPermOptions"
        :filter-node-method="handleMenuFilter"
        :default-expand-all="true"
        :check-strictly="!menuParentChildLinked"
        class="mt-5"
      >
        <template #default="{ data }">
          {{ data.label }}
        </template>
      </el-tree>

      <template #footer>
        <div class="dialog-footer">
          <el-button
            v-hasPerm="['sys:tenant-plan:assign']"
            type="primary"
            @click="handlePlanMenuSubmit"
          >
            确定
          </el-button>
          <el-button @click="planMenuDialogVisible = false">取消</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import {
  ElMessage,
  ElMessageBox,
  type FormInstance,
  type FormRules,
  type TreeInstance,
  type TreeNodeData,
} from "element-plus";
import { FullScreen, QuestionFilled, Refresh, Search, Switch } from "@element-plus/icons-vue";

import MenuAPI from "@/api/system/menu";
import TenantPlanAPI from "@/api/system/tenant-plan";
import type {
  TenantPlanForm,
  TenantPlanItem,
  TenantPlanQueryParams,
} from "@/api/system/tenant-plan";
import type { OptionItem } from "@/api/common";
import { usePageTable } from "@/composables";
import { CommonStatus } from "@/enums";
import { MenuScopeEnum } from "@/enums/business";

defineOptions({
  name: "TenantPlan",
  inheritAttrs: false,
});

const tableWrapperRef = ref<HTMLElement | null>(null);
const { toggle: toggleFullscreen } = useFullscreen(tableWrapperRef);

const queryFormRef = ref<FormInstance>();
const planFormRef = ref<FormInstance>();
const menuTreeRef = ref<TreeInstance>();

/** 分页表格数据管理 */
const { loading, list, total, params, fetchData, handleQuery, handleResetQuery } = usePageTable<
  TenantPlanItem,
  TenantPlanQueryParams
>({
  initialParams: {
    pageNum: 1,
    pageSize: 10,
    keywords: "",
  },
  request: (query) => TenantPlanAPI.getPage(query),
  onBeforeReset: () => queryFormRef.value?.resetFields(),
});

const dialogState = reactive({
  title: "",
  visible: false,
});

const initialFormData: TenantPlanForm = {
  name: "",
  code: "",
  status: CommonStatus.ENABLED,
  sort: 1,
  remark: "",
};

const formData = reactive<TenantPlanForm>({ ...initialFormData });

const rules: FormRules<TenantPlanForm> = {
  name: [{ required: true, message: "请输入套餐名称", trigger: "blur" }],
  code: [{ required: true, message: "请输入套餐编码", trigger: "blur" }],
  status: [{ required: true, message: "请选择状态", trigger: "change" }],
};

interface CheckedPlan {
  id?: number;
  name?: string;
}

const planMenuDialogVisible = ref(false);
const checkedPlan = ref<CheckedPlan>({});
const menuPermOptions = ref<OptionItem[]>([]);
const menuKeywords = ref("");
const menuExpanded = ref(true);
const menuParentChildLinked = ref(true);

interface ToggleableTreeNode {
  expand: () => void;
  collapse: () => void;
}

/**
 * 重置表单数据和验证状态
 */
function resetForm(): void {
  planFormRef.value?.resetFields();
  planFormRef.value?.clearValidate();
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
 * 关闭表单弹窗并清理临时状态。
 */
function closeDialog(): void {
  dialogState.visible = false;
  resetForm();
}

/**
 * 打开新增套餐弹窗
 */
function handleCreateClick(): void {
  dialogState.title = "新增套餐";
  openDialog();
}

/**
 * 打开编辑套餐弹窗并回填数据
 *
 * @param planId 套餐 ID
 */
async function handleEditClick(planId?: number): Promise<void> {
  if (!planId) return;
  dialogState.title = "修改套餐";
  const data = await TenantPlanAPI.getFormData(String(planId));
  Object.assign(formData, data);
  if (formData.status == null) {
    formData.status = CommonStatus.ENABLED;
  }
  if (formData.sort == null) {
    formData.sort = 1;
  }
  openDialog();
}

/** 校验并提交套餐表单 */
const handleSubmit = useDebounceFn(async (): Promise<void> => {
  const valid = await planFormRef.value?.validate().then(
    () => true,
    () => false
  );
  if (!valid) return;

  loading.value = true;
  try {
    if (formData.id) {
      await TenantPlanAPI.update(String(formData.id), formData);
      ElMessage.success("修改成功");
    } else {
      await TenantPlanAPI.create(formData);
      ElMessage.success("新增成功");
    }
    closeDialog();
    handleResetQuery();
  } finally {
    loading.value = false;
  }
}, 300);

/**
 * 删除套餐。
 *
 * @param planId 套餐 ID
 */
async function handleDelete(planId?: number): Promise<void> {
  if (!planId) return;

  try {
    await ElMessageBox.confirm("确认删除该租户套餐吗？", "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
  } catch {
    return;
  }

  loading.value = true;
  try {
    await TenantPlanAPI.deleteByIds(String(planId));
    ElMessage.success("删除成功");
    handleResetQuery();
  } finally {
    loading.value = false;
  }
}

/**
 * 打开菜单配置抽屉并回显已分配菜单。
 *
 * @param row 当前套餐行
 */
async function handleAssignMenuClick(row: TenantPlanItem): Promise<void> {
  if (!row.id) return;

  planMenuDialogVisible.value = true;
  checkedPlan.value = { id: row.id, name: row.name };

  loading.value = true;
  try {
    const [menuOptions, menuIds] = await Promise.all([
      MenuAPI.getOptions(false, MenuScopeEnum.TENANT),
      TenantPlanAPI.getPlanMenuIds(row.id),
    ]);

    menuPermOptions.value = menuOptions;
    await nextTick();

    menuTreeRef.value?.setCheckedKeys([], false);
    menuIds.forEach((menuId) => menuTreeRef.value?.setChecked(menuId, true, false));
  } finally {
    loading.value = false;
  }
}

/**
 * 关闭菜单配置抽屉并清理临时状态
 */
function closePlanMenuDialog(): void {
  planMenuDialogVisible.value = false;
  menuKeywords.value = "";
  menuExpanded.value = true;
  menuParentChildLinked.value = true;
  menuTreeRef.value?.setCheckedKeys([], false);
}

/**
 * 展开或收起菜单树全部节点。
 */
function toggleMenuTree(): void {
  menuExpanded.value = !menuExpanded.value;
  if (!menuTreeRef.value) return;

  Object.values(menuTreeRef.value.store.nodesMap).forEach((node) => {
    const treeNode = node as ToggleableTreeNode;
    if (menuExpanded.value) {
      treeNode.expand();
    } else {
      treeNode.collapse();
    }
  });
}

/**
 * 父子联动开关变化处理。
 *
 * @param val 开关当前值
 */
function handleMenuLinkChange(val: string | number | boolean): void {
  menuParentChildLinked.value = Boolean(val);
}

/**
 * 菜单树过滤函数。
 *
 * @param value 输入的关键字
 * @param data 当前节点数据
 */
function handleMenuFilter(value: string, data: TreeNodeData): boolean {
  if (!value) return true;
  return String(data.label ?? "").includes(value);
}

/**
 * 提交当前套餐的菜单权限配置。
 */
async function handlePlanMenuSubmit(): Promise<void> {
  const planId = checkedPlan.value.id;
  if (!planId) return;

  const checkedMenuIds: number[] = (menuTreeRef.value?.getCheckedNodes(false, true) ?? [])
    .map((node: TreeNodeData) => Number(node.value))
    .filter((value: number) => !Number.isNaN(value));

  loading.value = true;
  try {
    await TenantPlanAPI.updatePlanMenus(planId, checkedMenuIds);
    ElMessage.success("菜单配置成功");
    planMenuDialogVisible.value = false;
  } finally {
    loading.value = false;
  }
}

watch(menuKeywords, (val) => {
  menuTreeRef.value?.filter(val);
});

onMounted(() => {
  fetchData();
});
</script>
