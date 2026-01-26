<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="filter-section">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="关键字" prop="keywords">
          <el-input
            v-model="queryParams.keywords"
            placeholder="套餐名称/套餐编码"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="启用" :value="1" />
            <el-option label="停用" :value="0" />
          </el-select>
        </el-form-item>

        <el-form-item class="search-buttons">
          <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
          <el-button icon="refresh" @click="handleResetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="hover" class="table-section">
      <div class="table-section__toolbar">
        <div class="table-section__toolbar--actions">
          <el-button
            v-hasPerm="['sys:tenant-plan:create']"
            type="success"
            icon="plus"
            @click="handleOpenDialog()"
          >
            新增
          </el-button>
        </div>
      </div>

      <el-table
        ref="dataTableRef"
        v-loading="loading"
        :data="pageData"
        highlight-current-row
        border
        class="table-section__content"
      >
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column label="套餐名称" prop="name" min-width="120" />
        <el-table-column label="套餐编码" prop="code" width="160" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 1" type="success">启用</el-tag>
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
              @click="handleOpenPlanMenuDialog(scope.row)"
            >
              菜单配置
            </el-button>
            <el-button
              v-hasPerm="['sys:tenant-plan:update']"
              type="primary"
              size="small"
              link
              icon="edit"
              @click="handleOpenDialog(scope.row.id)"
            >
              编辑
            </el-button>
            <el-button
              v-hasPerm="['sys:tenant-plan:delete']"
              type="danger"
              size="small"
              link
              icon="delete"
              @click="handleDelete(scope.row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-if="total > 0"
        v-model:total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="fetchData"
      />
    </el-card>

    <!-- 租户套餐表单弹窗 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="520px"
      @close="handleCloseDialog"
    >
      <el-form ref="dataFormRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="套餐名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入套餐名称" />
        </el-form-item>
        <el-form-item label="套餐编码" prop="code">
          <el-input v-model="formData.code" placeholder="请输入套餐编码" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">停用</el-radio>
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
          <el-button @click="handleCloseDialog">取消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 方案菜单配置 -->
    <el-drawer
      v-model="planMenuDialogVisible"
      :title="'【' + checkedPlan.name + '】菜单配置'"
      size="600px"
      @close="handleClosePlanMenuDialog"
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
defineOptions({
  name: "TenantPlan",
  inheritAttrs: false,
});

import { ElMessage, ElMessageBox } from "element-plus";
import { useDebounceFn } from "@vueuse/core";

import MenuAPI from "@/api/system/menu";
import TenantPlanAPI from "@/api/system/tenant-plan";
import type {
  TenantPlanForm,
  TenantPlanItem,
  TenantPlanQueryParams,
  OptionItem,
} from "@/types/api";
import { MenuScopeEnum } from "@/enums/business";

const queryFormRef = ref();
const dataFormRef = ref();
const dataTableRef = ref();
const menuTreeRef = ref();

const loading = ref(false);
const total = ref(0);

const queryParams = reactive<TenantPlanQueryParams>({
  pageNum: 1,
  pageSize: 10,
  keywords: "",
});

const pageData = ref<TenantPlanItem[]>([]);
const menuPermOptions = ref<OptionItem[]>([]);

const dialog = reactive({
  title: "",
  visible: false,
});

const formData = reactive<TenantPlanForm>({
  id: undefined,
  name: "",
  code: "",
  status: 1,
  sort: 1,
  remark: "",
});

const rules = reactive({
  name: [{ required: true, message: "请输入套餐名称", trigger: "blur" }],
  code: [{ required: true, message: "请输入套餐编码", trigger: "blur" }],
  status: [{ required: true, message: "请选择状态", trigger: "change" }],
});

const planMenuDialogVisible = ref(false);
const checkedPlan = ref<{ id?: number; name?: string }>({});
const menuKeywords = ref("");
const menuExpanded = ref(true);
const menuParentChildLinked = ref(true);

// 获取租户套餐分页数据
function fetchData() {
  loading.value = true;
  TenantPlanAPI.getPage(queryParams)
    .then((res) => {
      pageData.value = res.data;
      total.value = res.page?.total ?? 0;
    })
    .finally(() => {
      loading.value = false;
    });
}

// 查询
function handleQuery() {
  queryParams.pageNum = 1;
  fetchData();
}

// 重置查询条件
function handleResetQuery() {
  queryFormRef.value?.resetFields();
  queryParams.pageNum = 1;
  fetchData();
}

// 打开新增/编辑弹窗
async function handleOpenDialog(planId?: number) {
  dialog.visible = true;
  if (planId) {
    dialog.title = "修改套餐";
    const data = await TenantPlanAPI.getFormData(String(planId));
    Object.assign(formData, data);
    if (formData.status == null) {
      formData.status = 1;
    }
    if (formData.sort == null) {
      formData.sort = 1;
    }
  } else {
    dialog.title = "新增套餐";
    Object.assign(formData, {
      id: undefined,
      name: "",
      code: "",
      status: 1,
      sort: 1,
      remark: "",
    });
  }
}

// 关闭弹窗并重置表单
function handleCloseDialog() {
  dialog.visible = false;
  dataFormRef.value?.resetFields();
  dataFormRef.value?.clearValidate();
  Object.assign(formData, {
    id: undefined,
    name: "",
    code: "",
    status: 1,
    sort: 1,
    remark: "",
  });
}

// 提交新增/编辑
const handleSubmit = useDebounceFn(async () => {
  const valid = await dataFormRef.value?.validate().catch(() => false);
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
    handleCloseDialog();
    handleResetQuery();
  } finally {
    loading.value = false;
  }
}, 300);

// 删除
function handleDelete(planId?: number) {
  if (!planId) return;
  ElMessageBox.confirm("确认删除该租户套餐吗？", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    loading.value = true;
    TenantPlanAPI.deleteByIds(String(planId))
      .then(() => {
        ElMessage.success("删除成功");
        handleResetQuery();
      })
      .finally(() => {
        loading.value = false;
      });
  });
}

// 打开方案菜单配置抽屉
async function handleOpenPlanMenuDialog(row: TenantPlanItem) {
  if (!row.id) return;
  planMenuDialogVisible.value = true;
  loading.value = true;
  checkedPlan.value = { id: row.id, name: row.name };

  try {
    // 套餐菜单仅允许业务菜单
    const menuOptions = await MenuAPI.getOptions(false, MenuScopeEnum.TENANT);
    menuPermOptions.value = menuOptions;
    const menuIds = await TenantPlanAPI.getPlanMenuIds(row.id);
    await nextTick();
    menuTreeRef.value?.setCheckedKeys([], false);
    menuIds.forEach((menuId) => menuTreeRef.value?.setChecked(menuId, true, false));
  } finally {
    loading.value = false;
  }
}

// 关闭方案菜单配置抽屉并重置状态
function handleClosePlanMenuDialog() {
  planMenuDialogVisible.value = false;
  menuKeywords.value = "";
  menuExpanded.value = true;
  menuParentChildLinked.value = true;
  menuTreeRef.value?.setCheckedKeys([], false);
}

// 展开/收缩菜单树
function toggleMenuTree() {
  menuExpanded.value = !menuExpanded.value;
  if (menuTreeRef.value) {
    Object.values(menuTreeRef.value.store.nodesMap).forEach((node: any) => {
      if (menuExpanded.value) {
        node.expand();
      } else {
        node.collapse();
      }
    });
  }
}

// 切换父子联动
function handleMenuLinkChange(val: string | number | boolean) {
  menuParentChildLinked.value = Boolean(val);
}

// 菜单树关键字过滤
watch(menuKeywords, (val) => {
  menuTreeRef.value?.filter(val);
});

// 菜单树过滤逻辑
function handleMenuFilter(value: string, data: { [key: string]: any }) {
  if (!value) return true;
  return data.label.includes(value);
}

// 提交方案菜单配置
async function handlePlanMenuSubmit() {
  const planId = checkedPlan.value.id;
  if (!planId) return;

  const checkedMenuIds: number[] = menuTreeRef
    .value!.getCheckedNodes(false, true)
    .map((node: any) => node.value);

  loading.value = true;
  try {
    await TenantPlanAPI.updatePlanMenus(planId, checkedMenuIds);
    ElMessage.success("菜单配置成功");
    planMenuDialogVisible.value = false;
  } finally {
    loading.value = false;
  }
}

// 初始化
onMounted(() => {
  fetchData();
});
</script>

<style scoped lang="scss"></style>
