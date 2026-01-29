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
              v-hasPerm="['sys:tenant:plan-assign']"
              type="primary"
              size="small"
              link
              icon="menu"
              @click="handleOpenTenantPlanDialog(scope.row)"
            >
              设置套餐
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

        <el-form-item
          v-if="!isPlatformTenant && (formData.id == null || String(formData.id) === '')"
          label="租户套餐"
          prop="planId"
        >
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

    <!-- 租户套餐设置 -->
    <el-drawer
      v-model="tenantPlanDialogVisible"
      :title="'【' + checkedTenant.name + '】设置套餐'"
      size="640px"
      @close="handleCloseTenantPlanDialog"
    >
      <el-form label-width="90px" class="mb-3">
        <el-form-item label="租户套餐">
          <el-select
            v-model="tenantPlanId"
            placeholder="请选择租户套餐"
            style="width: 100%"
            @change="handlePlanChange"
          >
            <el-option
              v-for="item in planOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <el-alert
        type="info"
        show-icon
        :closable="false"
        title="默认展示套餐菜单，如需微调请开启自定义"
        class="mb-3"
      />

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
          <el-checkbox
            v-model="menuParentChildLinked"
            class="ml-5"
            :disabled="!menuCustomizeEnabled"
            @change="handleMenuLinkChange"
          >
            父子联动
          </el-checkbox>
          <el-switch
            v-model="menuCustomizeEnabled"
            class="ml-5"
            inline-prompt
            active-text="自定义"
            inactive-text="默认"
            :disabled="!hasPermTenantMenu"
            @change="handleCustomizeToggle"
          />
          <el-tooltip placement="bottom">
            <template #content>开启自定义后可覆盖套餐菜单；关闭则仅使用套餐默认菜单</template>
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
        :props="menuTreeProps"
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
            v-hasPerm="['sys:tenant:update']"
            type="primary"
            @click="handleTenantPlanSubmit"
          >
            保存设置
          </el-button>
          <el-button @click="tenantPlanDialogVisible = false">取消</el-button>
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

const tenantPlanDialogVisible = ref(false);
const checkedTenant = ref<{ id?: number; name?: string; planId?: number }>({});
const checkedTenantForm = ref<TenantForm | null>(null);
const tenantPlanId = ref<number | undefined>();
const menuCustomizeEnabled = ref(false);
const planMenuIds = ref<number[]>([]);
const tenantMenuIds = ref<number[]>([]);
const menuKeywords = ref("");
const menuExpanded = ref(true);
const menuParentChildLinked = ref(true);
const menuSourceOptions = ref<OptionItem[]>([]);

const menuTreeProps = {
  children: "children",
  label: "label",
  disabled: "disabled",
};

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
      // 平台租户不绑定套餐，仅创建时校验
      validator: (_: unknown, value: number | undefined, callback: (error?: Error) => void) => {
        if (isPlatformTenant.value) return callback();
        if (formData.id != null && String(formData.id) !== "") return callback();
        if (value == null) return callback(new Error("请选择租户套餐"));
        return callback();
      },
      trigger: "change",
    },
  ],
});

const hasPermChangeStatus = computed(() => hasPerm("sys:tenant:change-status"));
const hasPermTenantMenu = computed(() => hasPerm("sys:tenant:plan-assign"));

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

async function handleOpenTenantPlanDialog(row: TenantItem) {
  const tenantId = row.id;
  if (tenantId == null || tenantId === "") return;
  if (isPlatformTenantId(tenantId)) return;

  tenantPlanDialogVisible.value = true;
  loading.value = true;
  menuCustomizeEnabled.value = false;
  menuKeywords.value = "";
  menuExpanded.value = true;
  menuParentChildLinked.value = true;

  checkedTenant.value = {
    id: Number(tenantId),
    name: row.name || String(tenantId),
    planId: row.planId != null ? Number(row.planId) : undefined,
  };

  try {
    const [tenantForm, menuOptions, menuIds] = await Promise.all([
      TenantAPI.getFormData(String(tenantId)),
      MenuAPI.getOptions(false, MenuScopeEnum.TENANT),
      hasPermTenantMenu.value ? TenantAPI.getTenantMenuIds(Number(tenantId)) : Promise.resolve([]),
    ]);
    checkedTenantForm.value = tenantForm;
    tenantPlanId.value = tenantForm.planId != null ? Number(tenantForm.planId) : undefined;
    menuSourceOptions.value = menuOptions;
    tenantMenuIds.value = normalizeMenuIds(menuIds);
    await handlePlanChange(tenantPlanId.value);
  } finally {
    loading.value = false;
  }
}

function handleCloseTenantPlanDialog() {
  tenantPlanDialogVisible.value = false;
  menuKeywords.value = "";
  menuExpanded.value = true;
  menuParentChildLinked.value = true;
  menuCustomizeEnabled.value = false;
  tenantPlanId.value = undefined;
  planMenuIds.value = [];
  tenantMenuIds.value = [];
  menuSourceOptions.value = [];
  menuPermOptions.value = [];
  checkedTenant.value = {};
  checkedTenantForm.value = null;
  menuTreeRef.value?.setCheckedKeys([], false);
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

function handleMenuLinkChange(val: string | number | boolean) {
  menuParentChildLinked.value = Boolean(val);
}

function handleCustomizeToggle() {
  menuPermOptions.value = applyMenuOptionsDisabled(
    menuPermOptions.value,
    !menuCustomizeEnabled.value
  );
  updateCheckedMenus();
}

async function handlePlanChange(planId?: number) {
  if (!planId) {
    planMenuIds.value = [];
    menuPermOptions.value = applyMenuOptionsDisabled(menuSourceOptions.value, true);
    await nextTick();
    menuTreeRef.value?.setCheckedKeys([], false);
    return;
  }
  loading.value = true;
  try {
    const menuIds = await TenantPlanAPI.getPlanMenuIds(planId);
    planMenuIds.value = normalizeMenuIds(menuIds);
    const allowedMenuIdSet = new Set(planMenuIds.value);
    const filteredOptions = allowedMenuIdSet.size
      ? filterMenuOptionsByIds(menuSourceOptions.value, allowedMenuIdSet)
      : menuSourceOptions.value;
    menuPermOptions.value = applyMenuOptionsDisabled(filteredOptions, !menuCustomizeEnabled.value);
    await nextTick();
    updateCheckedMenus();
  } finally {
    loading.value = false;
  }
}

function updateCheckedMenus() {
  const allowedMenuIdSet = new Set(planMenuIds.value);
  const baseCheckedIds =
    menuCustomizeEnabled.value && tenantMenuIds.value.length > 0
      ? tenantMenuIds.value
      : planMenuIds.value;
  const checkedMenuIds = allowedMenuIdSet.size
    ? baseCheckedIds.filter((menuId) => allowedMenuIdSet.has(menuId))
    : baseCheckedIds;
  menuTreeRef.value?.setCheckedKeys([], false);
  checkedMenuIds.forEach((menuId) => menuTreeRef.value?.setChecked(menuId, true, false));
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

async function handleTenantPlanSubmit() {
  const tenantId = checkedTenant.value.id;
  if (!tenantId) return;
  if (!tenantPlanId.value) {
    ElMessage.warning("请选择租户套餐");
    return;
  }

  const tenantForm = checkedTenantForm.value;
  if (!tenantForm) return;

  loading.value = true;
  try {
    const payload: TenantForm = {
      ...tenantForm,
      planId: tenantPlanId.value,
    };
    await TenantAPI.update(String(tenantId), payload);

    if (hasPermTenantMenu.value) {
      const allowedMenuIdSet = new Set(planMenuIds.value);
      const menuIds = menuCustomizeEnabled.value
        ? menuTreeRef.value!.getCheckedNodes(false, true).map((node: any) => node.value)
        : planMenuIds.value;
      const filteredMenuIds = allowedMenuIdSet.size
        ? menuIds.filter((menuId) => allowedMenuIdSet.has(menuId))
        : menuIds;
      await TenantAPI.updateTenantMenus(tenantId, filteredMenuIds);
    }

    ElMessage.success("套餐设置成功");
    tenantPlanDialogVisible.value = false;
    fetchData();
  } catch {
    ElMessage.error("套餐设置失败");
  } finally {
    loading.value = false;
  }
}

function normalizeMenuIds(menuIds: Array<number | string>) {
  return menuIds.map((menuId) => Number(menuId)).filter((menuId) => !Number.isNaN(menuId));
}

function applyMenuOptionsDisabled(options: OptionItem[], disabled: boolean): OptionItem[] {
  return options.map((option) => ({
    ...option,
    disabled,
    children: option.children ? applyMenuOptionsDisabled(option.children, disabled) : undefined,
  }));
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
