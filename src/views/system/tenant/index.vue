<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="filter-section">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item prop="keywords" label="关键字">
          <el-input
            v-model="queryParams.keywords"
            placeholder="租户名称/租户编码/域名"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item prop="status" label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="正常" :value="1" />
            <el-option label="禁用" :value="0" />
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
            v-hasPerm="['sys:tenant:create']"
            type="success"
            icon="plus"
            @click="handleOpenDialog()"
          >
            新增
          </el-button>
          <el-button
            v-hasPerm="['sys:tenant:delete']"
            type="danger"
            icon="delete"
            :disabled="ids.length === 0"
            @click="handleDelete()"
          >
            删除
          </el-button>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="pageData"
        highlight-current-row
        border
        class="table-section__content"
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          type="selection"
          width="55"
          align="center"
          :selectable="isTenantSelectable"
        />
        <el-table-column label="租户名称" prop="name" min-width="160" />
        <el-table-column label="租户编码" prop="code" width="140" />
        <el-table-column label="租户套餐" min-width="140">
          <template #default="scope">
            <span>{{ resolvePlanLabel(scope.row.planId) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="域名" prop="domain" min-width="160" />
        <el-table-column label="联系人" prop="contactName" width="120" />
        <el-table-column label="电话" prop="contactPhone" width="140" />
        <el-table-column label="状态" width="120" align="center">
          <template #default="scope">
            <el-switch
              v-if="hasPermChangeStatus"
              v-model="scope.row.status"
              inline-prompt
              active-text="正常"
              inactive-text="禁用"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(scope.row.id, $event)"
            />
            <el-tag v-else :type="scope.row.status === 1 ? 'success' : 'info'">
              {{ scope.row.status === 1 ? "正常" : "禁用" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="过期时间" prop="expireTime" width="180" />
        <el-table-column label="创建时间" prop="createTime" width="180" />
        <el-table-column fixed="right" label="操作" width="260">
          <template #default="scope">
            <el-button
              v-if="!isPlatformTenantId(scope.row.id)"
              v-hasPerm="['sys:tenant:assign']"
              type="primary"
              size="small"
              link
              icon="menu"
              @click="handleOpenTenantMenuDialog(scope.row)"
            >
              租户菜单
            </el-button>
            <el-button
              v-hasPerm="['sys:tenant:update']"
              type="primary"
              size="small"
              link
              icon="edit"
              @click="handleOpenDialog(scope.row.id)"
            >
              编辑
            </el-button>
            <el-button
              v-if="!isPlatformTenantId(scope.row.id)"
              v-hasPerm="['sys:tenant:delete']"
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

    <!-- 租户表单弹窗 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="600px"
      @close="handleCloseDialog"
    >
      <el-form ref="dataFormRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="租户名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入租户名称" />
        </el-form-item>

        <el-form-item label="租户编码" prop="code">
          <el-input
            v-model="formData.code"
            placeholder="请输入租户编码"
            :disabled="formData.id != null && String(formData.id) !== ''"
          />
        </el-form-item>

        <el-form-item label="域名" prop="domain">
          <el-input v-model="formData.domain" placeholder="demo.youlai.tech（可选）" />
        </el-form-item>

        <el-form-item v-if="!isPlatformTenant" label="租户套餐" prop="planId">
          <el-select v-model="formData.planId" placeholder="请选择租户套餐" style="width: 100%">
            <el-option
              v-for="item in planOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="联系人" prop="contactName">
          <el-input v-model="formData.contactName" placeholder="可选" />
        </el-form-item>

        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="formData.contactPhone" placeholder="可选" />
        </el-form-item>

        <el-form-item label="联系邮箱" prop="contactEmail">
          <el-input v-model="formData.contactEmail" placeholder="可选" />
        </el-form-item>

        <el-form-item label="过期时间" prop="expireTime">
          <el-date-picker
            v-model="formData.expireTime"
            type="datetime"
            placeholder="不填表示永不过期"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item
          v-if="formData.id == null || String(formData.id) === ''"
          label="管理员账号"
          prop="adminUsername"
        >
          <el-input v-model="formData.adminUsername" placeholder="为空则系统生成" />
        </el-form-item>

        <el-form-item
          v-if="formData.id != null && String(formData.id) !== ''"
          label="状态"
          prop="status"
        >
          <el-radio-group v-model="formData.status">
            <el-radio :value="1">正常</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
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
      v-model="tenantMenuDialogVisible"
      :title="'【' + checkedTenant.name + '】租户菜单配置'"
      size="600px"
      @close="handleCloseTenantMenuDialog"
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
            v-hasPerm="['sys:tenant:assign']"
            type="primary"
            @click="handleTenantMenuSubmit"
          >
            确定
          </el-button>
          <el-button @click="tenantMenuDialogVisible = false">取消</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "Tenant",
  inheritAttrs: false,
});

import { ElMessage, ElMessageBox } from "element-plus";
import { useDebounceFn } from "@vueuse/core";
import { hasPerm } from "@/utils/auth";

import TenantAPI from "@/api/system/tenant";
import TenantPlanAPI from "@/api/system/tenant-plan";
import MenuAPI from "@/api/system/menu";
import type {
  OptionItem,
  TenantCreateForm,
  TenantForm,
  TenantQueryParams,
  TenantItem,
} from "@/types/api";
import { MenuScopeEnum } from "@/enums/business";
import { isPlatformTenantId } from "@/utils/tenant";

const queryFormRef = ref();
const dataFormRef = ref();
const menuTreeRef = ref();

const loading = ref(false);
const ids = ref<number[]>([]);
const total = ref(0);

const queryParams = reactive<TenantQueryParams>({
  pageNum: 1,
  pageSize: 10,
  keywords: "",
});

const pageData = ref<TenantItem[]>([]);

const menuPermOptions = ref<OptionItem[]>([]);

const dialog = reactive({
  title: "",
  visible: false,
});

const tenantMenuDialogVisible = ref(false);
const checkedTenant = ref<{ id?: number; name?: string; planId?: number }>({});
const menuKeywords = ref("");
const menuExpanded = ref(true);
const menuParentChildLinked = ref(true);

const planOptions = ref<OptionItem[]>([]);

const formData = reactive<TenantForm & TenantCreateForm>({
  id: undefined,
  name: "",
  code: "",
  domain: "",
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  planId: undefined,
  remark: "",
  expireTime: undefined,
  status: 1,
  adminUsername: "",
});

const isPlatformTenant = computed(() => isPlatformTenantId(formData.id));

// 平台租户不允许批量删除
const isTenantSelectable = (row: TenantItem) => !isPlatformTenantId(row.id);

const rules = reactive({
  name: [{ required: true, message: "请输入租户名称", trigger: "blur" }],
  code: [{ required: true, message: "请输入租户编码", trigger: "blur" }],
  planId: [
    {
      // 平台租户不绑定套餐
      validator: (_: unknown, value: number | undefined, callback: (error?: Error) => void) => {
        if (isPlatformTenant.value) return callback();
        if (value == null) return callback(new Error("请选择租户套餐"));
        return callback();
      },
      trigger: "change",
    },
  ],
});

const hasPermChangeStatus = computed(() => hasPerm("sys:tenant:change-status"));

function handleStatusChange(tenantId: string | number | undefined, val: string | number | boolean) {
  if (tenantId == null) return;
  if (pageData.value.length > 0) {
    handleChangeStatus(String(tenantId), Number(val));
  }
}

function resolvePlanLabel(planId?: number) {
  if (planId == null) return "-";
  const matched = planOptions.value.find((item) => Number(item.value) === planId);
  return matched?.label || String(planId);
}

function fetchData() {
  loading.value = true;
  TenantAPI.getPage(queryParams)
    .then((res) => {
      pageData.value = res.data.map((item) => ({
        ...item,
        planId: item.planId != null ? Number(item.planId) : undefined,
      }));
      total.value = res.page?.total ?? 0;
    })
    .finally(() => {
      loading.value = false;
    });
}

async function handleOpenTenantMenuDialog(row: TenantItem) {
  const tenantId = row.id;
  if (tenantId == null || tenantId === "") return;
  if (isPlatformTenantId(tenantId)) {
    return;
  }
  const planId = row.planId;
  if (!planId) {
    ElMessage.warning("请先为租户选择套餐");
    return;
  }

  tenantMenuDialogVisible.value = true;
  loading.value = true;
  checkedTenant.value = {
    id: Number(tenantId),
    name: row.name || String(tenantId),
    planId,
  };

  try {
    const [menuOptions, planMenuIds, menuIds] = await Promise.all([
      MenuAPI.getOptions(false, MenuScopeEnum.TENANT),
      TenantPlanAPI.getPlanMenuIds(planId),
      TenantAPI.getTenantMenuIds(Number(tenantId)),
    ]);
    const normalizedPlanMenuIds = planMenuIds
      .map((menuId) => Number(menuId))
      .filter((menuId) => !Number.isNaN(menuId));
    const allowedMenuIdSet = new Set(normalizedPlanMenuIds);
    menuPermOptions.value = allowedMenuIdSet.size
      ? filterMenuOptionsByIds(menuOptions, allowedMenuIdSet)
      : menuOptions;
    const normalizedMenuIds = menuIds
      .map((menuId) => Number(menuId))
      .filter((menuId) => !Number.isNaN(menuId));
    await nextTick();
    menuTreeRef.value?.setCheckedKeys([], false);
    const checkedMenuIds = allowedMenuIdSet.size
      ? normalizedMenuIds.filter((menuId) => allowedMenuIdSet.has(menuId))
      : normalizedMenuIds;
    checkedMenuIds.forEach((menuId) => menuTreeRef.value?.setChecked(menuId, true, false));
  } finally {
    loading.value = false;
  }
}

function handleCloseTenantMenuDialog() {
  tenantMenuDialogVisible.value = false;
  menuKeywords.value = "";
  menuExpanded.value = true;
  menuParentChildLinked.value = true;
  menuTreeRef.value?.setCheckedKeys([], false);
  checkedTenant.value = {};
}

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

function handleMenuLinkChange(val: boolean) {
  menuParentChildLinked.value = val;
}

watch(menuKeywords, (val) => {
  menuTreeRef.value?.filter(val);
});

function handleMenuFilter(value: string, data: { [key: string]: any }) {
  if (!value) return true;
  return data.label.includes(value);
}

function filterMenuOptionsByIds(
  options: OptionItem[],
  allowedMenuIdSet: Set<number>
): OptionItem[] {
  return options.reduce<OptionItem[]>((acc, option) => {
    const children = option.children
      ? filterMenuOptionsByIds(option.children, allowedMenuIdSet)
      : [];
    const allowed = allowedMenuIdSet.has(Number(option.value));
    if (allowed || children.length > 0) {
      acc.push({
        ...option,
        children: children.length > 0 ? children : undefined,
      });
    }
    return acc;
  }, []);
}

async function handleTenantMenuSubmit() {
  const tenantId = checkedTenant.value.id;
  if (!tenantId) return;

  const checkedMenuIds: number[] = menuTreeRef
    .value!.getCheckedNodes(false, true)
    .map((node: any) => node.value);

  loading.value = true;
  try {
    await TenantAPI.updateTenantMenus(tenantId, checkedMenuIds);
    ElMessage.success("租户菜单配置成功");
    tenantMenuDialogVisible.value = false;
  } catch {
    ElMessage.error("租户菜单配置失败");
  } finally {
    loading.value = false;
  }
}

function handleQuery() {
  queryParams.pageNum = 1;
  fetchData();
}

function handleResetQuery() {
  queryFormRef.value?.resetFields();
  queryParams.pageNum = 1;
  fetchData();
}

function handleSelectionChange(selection: any) {
  ids.value = selection.map((item: any) => Number(item.id));
}

async function handleOpenDialog(tenantId?: string) {
  dialog.visible = true;
  if (tenantId != null && tenantId !== "") {
    dialog.title = "修改租户";
    const data = await TenantAPI.getFormData(tenantId);
    Object.assign(formData, data);
    formData.adminUsername = "";
    formData.planId = formData.planId != null ? Number(formData.planId) : undefined;
    if (isPlatformTenant.value) {
      formData.planId = undefined;
    }
  } else {
    dialog.title = "新增租户";
    Object.assign(formData, {
      id: undefined,
      name: "",
      code: "",
      domain: "",
      contactName: "",
      contactPhone: "",
      contactEmail: "",
      planId: undefined,
      remark: "",
      expireTime: undefined,
      status: 1,
      adminUsername: "",
    });
  }
}

function handleCloseDialog() {
  dialog.visible = false;
  dataFormRef.value?.resetFields();
  dataFormRef.value?.clearValidate();
  Object.assign(formData, {
    id: undefined,
    name: "",
    code: "",
    domain: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    planId: undefined,
    remark: "",
    expireTime: undefined,
    status: 1,
    adminUsername: "",
  });
}

const handleSubmit = useDebounceFn(async () => {
  const valid = await dataFormRef.value?.validate().catch(() => false);
  if (!valid) return;

  loading.value = true;
  try {
    const tenantId = formData.id;
    if (tenantId != null && String(tenantId) !== "") {
      const payload: TenantForm = {
        id: formData.id,
        name: formData.name,
        code: formData.code,
        domain: formData.domain,
        contactName: formData.contactName,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
        planId: formData.planId,
        remark: formData.remark,
        expireTime: formData.expireTime,
        status: formData.status,
      };
      await TenantAPI.update(String(tenantId), payload);
      ElMessage.success("修改成功");
    } else {
      const payload: TenantCreateForm = {
        name: formData.name,
        code: formData.code,
        domain: formData.domain,
        contactName: formData.contactName,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
        planId: formData.planId,
        remark: formData.remark,
        expireTime: formData.expireTime,
        adminUsername: formData.adminUsername,
      };
      const result = await TenantAPI.create(payload);
      ElMessage.success(`新增成功：管理员账号 ${result?.adminUsername || ""}`);
    }

    handleCloseDialog();
    handleResetQuery();
  } catch {
    ElMessage.error(formData.id != null && String(formData.id) !== "" ? "修改失败" : "新增失败");
  } finally {
    loading.value = false;
  }
}, 300);

function handleDelete(tenantId?: string) {
  const tenantIds = tenantId != null && tenantId !== "" ? tenantId : ids.value.join(",");
  if (!tenantIds) {
    ElMessage.warning("请勾选删除项");
    return;
  }

  ElMessageBox.confirm("确认删除选中的租户吗？", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      loading.value = true;
      try {
        await TenantAPI.deleteByIds(tenantIds);
        ElMessage.success("删除成功");
        handleResetQuery();
      } finally {
        loading.value = false;
      }
    })
    .catch(() => {
      // 用户取消
    });
}

async function handleChangeStatus(id: string | undefined, status: number) {
  if (id == null || id === "") return;
  try {
    await TenantAPI.updateStatus(String(id), status);
    ElMessage.success("状态更新成功");
  } catch {
    ElMessage.error("状态更新失败");
    fetchData();
  }
}

onMounted(() => {
  fetchData();
  fetchPlanOptions();
});

async function fetchPlanOptions() {
  try {
    const options = await TenantPlanAPI.getOptions();
    planOptions.value = options.map((item) => ({
      ...item,
      value: item.value != null ? Number(item.value) : item.value,
    }));
  } catch {
    planOptions.value = [];
  }
}
</script>

<style scoped lang="scss"></style>
