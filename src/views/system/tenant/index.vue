<template>
  <div class="page-container">
    <el-card class="page-search" shadow="never">
      <el-form ref="queryFormRef" :model="params" :inline="true">
        <el-form-item prop="keywords" label="关键字">
          <el-input
            v-model="params.keywords"
            placeholder="租户名称/租户编码/域名"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item prop="status" label="状态">
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
          <el-button v-hasPerm="['sys:tenant:create']" type="primary" @click="openDialog()">
            新增
          </el-button>
          <el-button
            v-hasPerm="['sys:tenant:delete']"
            type="danger"
            :disabled="!hasSelection"
            @click="handleDelete()"
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
          v-loading="loading"
          :data="list"
          highlight-current-row
          class="page-table"
          border
          height="100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            type="selection"
            width="55"
            align="center"
            :selectable="isTenantSelectable"
          />
          <el-table-column label="租户名称" prop="name" min-width="140" />
          <el-table-column label="租户编码" prop="code" width="120" />
          <el-table-column label="租户套餐" min-width="120">
            <template #default="scope">
              <span>{{ resolvePlanLabel(scope.row.planId) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="域名" prop="domain" min-width="140" />
          <el-table-column label="联系人" prop="contactName" width="100" />
          <el-table-column label="电话" prop="contactPhone" width="120" />
          <el-table-column label="状态" width="90" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.status === CommonStatus.ENABLED ? 'success' : 'info'">
                {{ scope.row.status === CommonStatus.ENABLED ? "正常" : "禁用" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="过期时间" prop="expireTime" width="160" />
          <el-table-column label="创建时间" prop="createTime" width="160" />
          <el-table-column fixed="right" label="操作" width="320">
            <template #default="scope">
              <el-tooltip
                v-if="!isPlatformTenantId(scope.row.id)"
                content="更换租户套餐（将影响可用功能）"
                placement="top"
              >
                <el-button
                  v-hasPerm="['sys:tenant:plan-assign']"
                  type="primary"
                  size="small"
                  link
                  icon="menu"
                  title="更换租户套餐（将影响可用功能）"
                  @click="openTenantPlanDialog(scope.row)"
                >
                  更换套餐
                </el-button>
              </el-tooltip>
              <el-tooltip
                v-if="!isPlatformTenantId(scope.row.id)"
                content="在当前套餐范围内配置租户可用功能"
                placement="top"
              >
                <el-button
                  v-hasPerm="['sys:tenant:plan-assign']"
                  type="primary"
                  size="small"
                  link
                  icon="setting"
                  :disabled="!scope.row.planId"
                  title="在当前套餐范围内配置租户可用功能"
                  @click="openTenantCustomizeDialog(scope.row)"
                >
                  套餐功能配置
                </el-button>
              </el-tooltip>
              <el-button
                v-hasPerm="['sys:tenant:update']"
                type="primary"
                size="small"
                link
                @click="openDialog(scope.row.id)"
              >
                编辑
              </el-button>
              <el-button
                v-if="!isPlatformTenantId(scope.row.id)"
                v-hasPerm="['sys:tenant:delete']"
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
      width="600px"
      @close="closeDialog"
    >
      <el-form ref="tenantFormRef" :model="formData" :rules="rules" label-width="100px">
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
            <el-radio :value="CommonStatus.ENABLED">正常</el-radio>
            <el-radio :value="CommonStatus.DISABLED">禁用</el-radio>
          </el-radio-group>
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

    <el-dialog
      v-model="tenantPlanSelectVisible"
      title="更换租户套餐"
      width="520px"
      @close="closeTenantPlanSelectDialog"
    >
      <el-form label-width="90px" class="mb-3">
        <el-form-item label="当前套餐">
          <el-input :model-value="resolvePlanLabel(checkedTenant.planId)" disabled />
        </el-form-item>

        <el-form-item label="目标套餐">
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

      <div class="mb-3">
        <div class="mb-2 font-medium">升级场景</div>
        <div class="mb-3">升级套餐后，将解锁更多功能菜单，需在套餐功能配置中手动启用。</div>
        <div class="mb-2 font-medium">降级场景（红色 / warning）</div>
        <el-alert
          type="warning"
          :closable="false"
          show-icon
          title="⚠ 降级套餐将导致超出套餐范围的功能被移除，相关功能将立即不可用。"
        />
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button
            v-hasPerm="['sys:tenant:plan-assign']"
            type="primary"
            :disabled="!tenantPlanId || isPlanMenuEmpty"
            @click="handleTenantPlanSelectSubmit"
          >
            确认更换
          </el-button>
          <el-button @click="tenantPlanSelectVisible = false">取消</el-button>
        </div>
      </template>
    </el-dialog>

    <el-drawer
      v-model="tenantPlanDialogVisible"
      title="套餐功能配置"
      size="640px"
      @close="closeTenantPlanDialog"
    >
      <el-alert
        type="info"
        :closable="false"
        show-icon
        class="mb-3"
        :title="`当前功能基于「${resolvePlanLabel(tenantPlanId)}」，你可以关闭不需要的功能。如需增加功能，请升级套餐。`"
      />
      <div class="text-xs text-gray-500 mb-2">仅展示当前套餐包含的功能</div>

      <el-scrollbar class="h-[60vh]">
        <ElTree
          ref="menuTreeRef"
          node-key="value"
          show-checkbox
          :props="menuTreeProps"
          :data="menuPermOptions"
          :default-expanded-keys="menuExpandedKeys"
          :default-expand-all="false"
          class="mt-5"
          @check="handleMenuCheckedChange"
        >
          <template #default="{ data }">
            {{ data.label }}
          </template>
        </ElTree>
      </el-scrollbar>

      <template #footer>
        <div class="dialog-footer">
          <el-button
            v-hasPerm="['sys:tenant:plan-assign']"
            type="primary"
            :disabled="isPlanMenuEmpty"
            @click="handleTenantPlanSubmit"
          >
            保存配置
          </el-button>
          <el-button @click="tenantPlanDialogVisible = false">取消</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import {
  ElMessage,
  ElMessageBox,
  ElTree,
  type FormInstance,
  type FormRules,
  type TreeNodeData,
} from "element-plus";
import { FullScreen, Refresh } from "@element-plus/icons-vue";

import TenantAPI from "@/api/system/tenant";
import TenantPlanAPI from "@/api/system/tenant-plan";
import MenuAPI from "@/api/system/menu";
import type {
  TenantCreateForm,
  TenantForm,
  TenantItem,
  TenantQueryParams,
} from "@/api/system/tenant";
import type { OptionItem } from "@/api/common";
import { CommonStatus, MenuScopeEnum } from "@/enums";
import { hasPerm } from "@/utils/auth";
import { isPlatformTenantId } from "@/utils/tenant";
import { usePageTable, useTableSelection } from "@/composables";

defineOptions({
  name: "Tenant",
  inheritAttrs: false,
});

const tableWrapperRef = ref<HTMLElement | null>(null);
const { toggle: toggleFullscreen } = useFullscreen(tableWrapperRef);

const queryFormRef = ref<FormInstance>();
const tenantFormRef = ref<FormInstance>();
const menuTreeRef = ref<InstanceType<typeof ElTree>>();

/** 分页表格数据管理 */
const { loading, list, total, params, fetchData, handleQuery, handleResetQuery } = usePageTable<
  TenantItem,
  TenantQueryParams
>({
  initialParams: {
    pageNum: 1,
    pageSize: 10,
    keywords: "",
  },
  request: async (queryParams) => {
    // 后端返回的 planId 可能是字符串，这里统一转成 number
    const data = await TenantAPI.getPage(queryParams);
    return {
      list: data.list.map((item) => ({
        ...item,
        planId: item.planId != null ? Number(item.planId) : undefined,
      })),
      total: data.total,
    };
  },
  onBeforeReset: () => queryFormRef.value?.resetFields(),
});

const { selectedIds, hasSelection, handleSelectionChange } = useTableSelection<TenantItem>();

const dialogState = reactive({
  title: "",
  visible: false,
});

const initialFormData: TenantForm & TenantCreateForm = {
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
  status: CommonStatus.ENABLED,
  adminUsername: "",
};

const formData = reactive<TenantForm & TenantCreateForm>({ ...initialFormData });

// 当前表单是否为平台租户。
const isPlatformTenant = computed(() => isPlatformTenantId(formData.id));

/**
 * 表格行是否可勾选（平台租户不可勾选）。
 *
 * @param row 当前租户行
 */
const isTenantSelectable = (row: TenantItem) => !isPlatformTenantId(row.id);

const rules: FormRules<TenantForm & TenantCreateForm> = {
  name: [{ required: true, message: "请输入租户名称", trigger: "blur" }],
  code: [{ required: true, message: "请输入租户编码", trigger: "blur" }],
  planId: [
    {
      validator: (_: unknown, value: number | undefined, callback: (error?: Error) => void) => {
        if (isPlatformTenant.value) return callback();
        if (formData.id != null && String(formData.id) !== "") return callback();
        if (value == null) return callback(new Error("请选择租户套餐"));
        return callback();
      },
      trigger: "change",
    },
  ],
};

const planOptions = ref<OptionItem[]>([]);

/**
 * 根据套餐 ID 解析显示名称。
 *
 * @param planId 套餐 ID
 */
function resolvePlanLabel(planId?: number): string {
  if (planId == null) return "-";
  const matched = planOptions.value.find((item) => Number(item.value) === planId);
  return matched?.label || String(planId);
}

const tenantPlanSelectVisible = ref(false);
const tenantPlanDialogVisible = ref(false);
const checkedTenant = ref<{ id?: number; name?: string; planId?: number }>({});
const checkedTenantForm = ref<TenantForm | null>(null);
const tenantPlanId = ref<number | undefined>();
const planMenuIds = ref<number[]>([]);
const tenantMenuIds = ref<number[]>([]);
const menuSourceOptions = ref<OptionItem[]>([]);
const planPreviewOptions = ref<OptionItem[]>([]);
const menuPermOptions = ref<OptionItem[]>([]);
const menuCheckedCount = ref(0);
const menuParentChildLinked = ref(true);
const originalEnabledMenuIds = ref<number[]>([]);

/** 当前可见菜单的默认展开节点（顶级节点全部展开）。 */
const menuExpandedKeys = computed(() => menuPermOptions.value.map((item) => item.value));

/**
 * el-tree 节点属性映射。
 */
const menuTreeProps = {
  children: "children",
  label: "label",
  disabled: "disabled",
};

// 目标套餐未配置菜单时禁止提交。
const isPlanMenuEmpty = computed(
  () => tenantPlanId.value != null && planMenuIds.value.length === 0
);

const hasPermTenantMenu = computed(() => hasPerm("sys:tenant:plan-assign"));

/** 重置表单数据和验证状态 */
function resetForm(): void {
  tenantFormRef.value?.resetFields();
  tenantFormRef.value?.clearValidate();
  Object.keys(formData).forEach((key) => {
    delete (formData as Record<string, unknown>)[key];
  });
  Object.assign(formData, initialFormData);
}

/**
 * 统一菜单 ID 为 number 并过滤无效值。
 *
 * @param menuIds 原始菜单 ID 列表（可能混有字符串）
 */
function normalizeMenuIds(menuIds: Array<number | string>): number[] {
  return menuIds.map((menuId) => Number(menuId)).filter((menuId) => !Number.isNaN(menuId));
}

/**
 * 递归设置菜单节点禁用状态。
 *
 * 用于在套餐功能配置抽屉里"锁定"套餐范围外的菜单。
 *
 * @param options 菜单选项树
 * @param disabled 是否禁用
 */
function applyMenuOptionsDisabled(options: OptionItem[], disabled: boolean): OptionItem[] {
  return options.map((option) => ({
    ...option,
    disabled,
    children: option.children ? applyMenuOptionsDisabled(option.children, disabled) : undefined,
  }));
}

/**
 * 过滤菜单树，仅保留套餐允许的节点。
 *
 * @param options 原始菜单选项树
 * @param allowedMenuIdSet 套餐允许的菜单 ID 集合
 */
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

/**
 * 根据套餐范围同步勾选菜单。
 *
 * 优先保留租户原有勾选（仅在套餐允许范围内），否则回退到套餐默认全选。
 */
function updateCheckedMenus(): void {
  const allowedMenuIdSet = new Set(planMenuIds.value);
  const checkedMenuIds =
    tenantMenuIds.value.length > 0
      ? tenantMenuIds.value.filter((menuId) => allowedMenuIdSet.has(menuId))
      : planMenuIds.value;
  menuTreeRef.value?.setCheckedKeys([], false);
  checkedMenuIds.forEach((menuId) => menuTreeRef.value?.setChecked(menuId, true, false));
  menuCheckedCount.value = checkedMenuIds.length;
}

/**
 * 切换目标套餐时更新可用菜单。
 *
 * @param planId 目标套餐 ID
 */
async function handlePlanChange(planId?: number): Promise<void> {
  if (!planId) {
    planMenuIds.value = [];
    planPreviewOptions.value = [];
    menuPermOptions.value = applyMenuOptionsDisabled([], false);
    await nextTick();
    menuTreeRef.value?.setCheckedKeys([], false);
    menuCheckedCount.value = 0;
    return;
  }
  loading.value = true;
  try {
    const menuIds = await TenantPlanAPI.getPlanMenuIds(planId);
    planMenuIds.value = normalizeMenuIds(menuIds);
    const allowedMenuIdSet = new Set(planMenuIds.value);
    const filteredOptions = allowedMenuIdSet.size
      ? filterMenuOptionsByIds(menuSourceOptions.value, allowedMenuIdSet)
      : [];
    planPreviewOptions.value = filteredOptions;
    menuPermOptions.value = applyMenuOptionsDisabled(filteredOptions, false);
    await nextTick();
    updateCheckedMenus();
  } finally {
    loading.value = false;
  }
}

/**
 * 树节点勾选变化时更新勾选计数。
 */
function handleMenuCheckedChange(): void {
  const checkedKeys = menuTreeRef.value?.getCheckedKeys(false) || [];
  menuCheckedCount.value = checkedKeys.length;
}

/**
 * 重置套餐相关的所有临时状态。
 */
function resetTenantPlanState(): void {
  tenantPlanDialogVisible.value = false;
  tenantPlanSelectVisible.value = false;
  originalEnabledMenuIds.value = [];
  tenantPlanId.value = undefined;
  planMenuIds.value = [];
  tenantMenuIds.value = [];
  planPreviewOptions.value = [];
  menuPermOptions.value = [];
  menuSourceOptions.value = [];
  menuCheckedCount.value = 0;
  menuParentChildLinked.value = true;
  checkedTenant.value = {};
  checkedTenantForm.value = null;
  menuTreeRef.value?.setCheckedKeys([], false);
}

/**
 * 关闭套餐选择弹窗。
 */
function closeTenantPlanSelectDialog(): void {
  resetTenantPlanState();
}

/**
 * 关闭套餐功能配置抽屉。
 */
function closeTenantPlanDialog(): void {
  resetTenantPlanState();
}

/**
 * 打开更换套餐弹窗。
 *
 * @param row 当前租户行
 */
async function openTenantPlanDialog(row: TenantItem): Promise<void> {
  const tenantId = row.id;
  if (tenantId == null || tenantId === "") return;
  if (isPlatformTenantId(tenantId)) return;

  tenantPlanSelectVisible.value = true;
  loading.value = true;
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
    originalEnabledMenuIds.value =
      tenantMenuIds.value.length > 0 ? [...tenantMenuIds.value] : [...planMenuIds.value];
    updateCheckedMenus();
  } finally {
    loading.value = false;
  }
}

/**
 * 打开套餐功能配置抽屉（不经过"更换套餐"流程）。
 *
 * @param row 当前租户行（可选，复用弹窗上下文时不传）
 */
async function openTenantCustomizeDialog(row?: TenantItem): Promise<void> {
  const tenantId = row?.id ?? checkedTenant.value.id;
  if (!tenantId) return;
  if (isPlatformTenantId(tenantId)) return;

  loading.value = true;
  menuParentChildLinked.value = true;

  checkedTenant.value = {
    id: Number(tenantId),
    name: row?.name || checkedTenant.value.name || String(tenantId),
    planId: row?.planId != null ? Number(row.planId) : checkedTenant.value.planId,
  };

  try {
    const [tenantForm, menuOptions, menuIds] = await Promise.all([
      TenantAPI.getFormData(String(tenantId)),
      MenuAPI.getOptions(false, MenuScopeEnum.TENANT),
      hasPermTenantMenu.value ? TenantAPI.getTenantMenuIds(Number(tenantId)) : Promise.resolve([]),
    ]);
    checkedTenantForm.value = tenantForm;
    tenantPlanId.value = tenantForm.planId != null ? Number(tenantForm.planId) : undefined;
    if (!tenantPlanId.value) {
      ElMessage.warning("请先选择套餐");
      return;
    }
    menuSourceOptions.value = menuOptions;
    tenantMenuIds.value = normalizeMenuIds(menuIds);
    await handlePlanChange(tenantPlanId.value);
    menuPermOptions.value = applyMenuOptionsDisabled(planPreviewOptions.value, false);
    tenantPlanDialogVisible.value = true;
    tenantPlanSelectVisible.value = false;
    await nextTick();
    updateCheckedMenus();
  } finally {
    loading.value = false;
  }
}

/**
 * 提交更换套餐操作。
 *
 * 包含二次确认，并同步更新租户的菜单权限（保留套餐范围内原勾选）。
 */
async function handleTenantPlanSelectSubmit(): Promise<void> {
  const tenantId = checkedTenant.value.id;
  if (!tenantId) return;
  if (!tenantPlanId.value) {
    ElMessage.warning("请选择租户套餐");
    return;
  }
  if (isPlanMenuEmpty.value) {
    ElMessage.warning("该套餐未配置菜单");
    return;
  }

  const currentPlanLabel = resolvePlanLabel(checkedTenant.value.planId);
  const targetPlanLabel = resolvePlanLabel(tenantPlanId.value);
  const tenantName = checkedTenant.value.name || "";

  try {
    await ElMessageBox.confirm(
      `确认将租户「${tenantName}」\n从「${currentPlanLabel}」更换为「${targetPlanLabel}」？\n\n该操作将立即生效，并影响租户可用功能。`,
      "确认更换套餐",
      {
        type: "warning",
        confirmButtonText: "确认更换",
        cancelButtonText: "取消",
      }
    );
  } catch {
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
      const targetPlanMenuIdSet = new Set(planMenuIds.value);
      const keepMenuIds = originalEnabledMenuIds.value.filter((menuId) =>
        targetPlanMenuIdSet.has(menuId)
      );
      await TenantAPI.updateTenantMenus(tenantId, keepMenuIds);
    }
    ElMessage.success("套餐已更换，请确认租户功能配置");
    checkedTenant.value.planId = tenantPlanId.value;
    tenantPlanSelectVisible.value = false;
    fetchData();
  } catch {
    ElMessage.error("套餐选择失败");
  } finally {
    loading.value = false;
  }
}

/**
 * 提交套餐功能配置更新。
 */
async function handleTenantPlanSubmit(): Promise<void> {
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
      const rawMenuIds: number[] = menuTreeRef.value
        ? (menuTreeRef.value
            .getCheckedNodes(false, true)
            .map((node: TreeNodeData) => Number(node.value))
            .filter((value: number) => !Number.isNaN(value)) as number[])
        : planMenuIds.value;
      const filteredMenuIds: number[] = allowedMenuIdSet.size
        ? rawMenuIds.filter((menuId: number) => allowedMenuIdSet.has(menuId))
        : rawMenuIds;
      await TenantAPI.updateTenantMenus(tenantId, filteredMenuIds);
    }

    ElMessage.success("租户功能配置已更新");
    tenantPlanDialogVisible.value = false;
    fetchData();
  } catch {
    ElMessage.error("菜单微调失败");
  } finally {
    loading.value = false;
  }
}

/**
 * 打开新增/编辑租户弹窗。
 *
 * @param tenantId 租户 ID（编辑时传入）
 */
async function openDialog(tenantId?: string): Promise<void> {
  dialogState.visible = true;
  if (tenantId != null && tenantId !== "") {
    dialogState.title = "修改租户";
    const data = await TenantAPI.getFormData(tenantId);
    Object.assign(formData, data);
    formData.adminUsername = "";
    formData.planId = formData.planId != null ? Number(formData.planId) : undefined;
    if (isPlatformTenant.value) {
      formData.planId = undefined;
    }
  } else {
    dialogState.title = "新增租户";
    resetForm();
  }
}

/**
 * 关闭租户表单弹窗并重置表单。
 */
function closeDialog(): void {
  dialogState.visible = false;
  resetForm();
}

/** 提交租户表单。 */
const handleSubmit = useDebounceFn(async (): Promise<void> => {
  const valid = await tenantFormRef.value?.validate().then(
    () => true,
    () => false
  );
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

    closeDialog();
    handleResetQuery();
  } finally {
    loading.value = false;
  }
}, 300);

/**
 * 删除单个或批量租户。
 *
 * @param tenantId 指定时删除单个租户；不指定时删除表格勾选项
 */
async function handleDelete(tenantId?: string): Promise<void> {
  const tenantIds = tenantId != null && tenantId !== "" ? tenantId : selectedIds.value.join(",");
  if (!tenantIds) {
    ElMessage.warning("请勾选删除项");
    return;
  }

  try {
    await ElMessageBox.confirm("确认删除选中的租户吗？", "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
  } catch {
    return;
  }

  loading.value = true;
  try {
    await TenantAPI.deleteByIds(tenantIds);
    ElMessage.success("删除成功");
    handleResetQuery();
  } finally {
    loading.value = false;
  }
}

/**
 * 加载租户套餐选项。
 */
async function fetchPlanOptions(): Promise<void> {
  const options = await TenantPlanAPI.getOptions();
  planOptions.value = options.map((item) => ({
    ...item,
    value: item.value != null ? Number(item.value) : item.value,
  }));
}

onMounted(() => {
  fetchData();
  fetchPlanOptions();
});
</script>
