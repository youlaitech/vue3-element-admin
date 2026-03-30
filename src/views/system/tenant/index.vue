<template>
  <div class="page-container">
    <el-card class="page-search" shadow="never">
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

        <el-form-item>
          <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
          <el-button icon="refresh" @click="handleResetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="page-content" shadow="never">
      <div class="page-toolbar">
        <div class="page-toolbar__left">
          <el-button
            v-hasPerm="['sys:tenant:create']"
            type="success"
            icon="plus"
            @click="openDialog()"
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
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
              {{ scope.row.status === 1 ? "正常" : "禁用" }}
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
              icon="edit"
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

    <el-dialog
      v-model="dialogState.visible"
      :title="dialogState.title"
      width="600px"
      @close="closeDialog"
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
          <el-button @click="closeDialog">取消</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog
      v-model="tenantPlanSelectVisible"
      title="更换租户套餐"
      width="520px"
      @close="closeTenantPlanSelectDialog()"
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
      @close="closeTenantPlanDialog()"
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
        <el-tree
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
        </el-tree>
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
defineOptions({
  name: "Tenant",
  inheritAttrs: false,
});

import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus";
import { useDebounceFn } from "@vueuse/core";
import { hasPerm } from "@/utils/auth";
import TenantAPI from "@/api/system/tenant";
import TenantPlanAPI from "@/api/system/tenant-plan";
import MenuAPI from "@/api/system/menu";
import type {
  TenantCreateForm,
  TenantForm,
  TenantQueryParams,
  TenantItem,
} from "@/api/system/tenant";
import type { OptionItem } from "@/api/common";
import { MenuScopeEnum } from "@/enums/business";
import { isPlatformTenantId } from "@/utils/tenant";

// 表单引用
const queryFormRef = ref<FormInstance>();
const dataFormRef = ref<FormInstance>();
const menuTreeRef = ref();
const planPreviewTreeRef = ref();

// 查询参数
const queryParams = reactive<TenantQueryParams>({
  pageNum: 1,
  pageSize: 10,
  keywords: "",
});

// 列表数据
const pageData = ref<TenantItem[]>([]);
const menuPermOptions = ref<OptionItem[]>([]);
const planOptions = ref<OptionItem[]>([]);
const total = ref(0);
const loading = ref(false);
const ids = ref<number[]>([]);

// 弹窗状态
const dialogState = reactive({
  title: "",
  visible: false,
});

// 套餐选择弹窗状态
const tenantPlanSelectVisible = ref(false);
const tenantPlanDialogVisible = ref(false);
const checkedTenant = ref<{ id?: number; name?: string; planId?: number }>({});
const checkedTenantForm = ref<TenantForm | null>(null);
const tenantPlanId = ref<number | undefined>();
const planMenuIds = ref<number[]>([]);
const tenantMenuIds = ref<number[]>([]);
const menuSourceOptions = ref<OptionItem[]>([]);
const planPreviewOptions = ref<OptionItem[]>([]);
const menuCheckedCount = ref(0);
const menuKeywords = ref("");
const planPreviewKeywords = ref("");
const menuExpanded = ref(false);
const planPreviewExpanded = ref(false);
const menuParentChildLinked = ref(true);
const originalEnabledMenuIds = ref<number[]>([]);

// 计算当前可见菜单的默认展开节点
const menuExpandedKeys = computed(() => menuPermOptions.value.map((item) => item.value));

const menuTreeProps = {
  children: "children",
  label: "label",
  disabled: "disabled",
};

// 目标套餐未配置菜单时提示禁止提交
const isPlanMenuEmpty = computed(
  () => tenantPlanId.value != null && planMenuIds.value.length === 0
);

// 表单数据
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

// 当前表单是否为平台租户
const isPlatformTenant = computed(() => isPlatformTenantId(formData.id));

// 平台租户不允许批量删除
const isTenantSelectable = (row: TenantItem) => !isPlatformTenantId(row.id);

// 验证规则
const rules: FormRules = {
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

const hasPermTenantMenu = computed(() => hasPerm("sys:tenant:plan-assign"));

/**
 * 根据套餐ID解析显示名称
 */
function resolvePlanLabel(planId?: number): string {
  if (planId == null) return "-";
  const matched = planOptions.value.find((item) => Number(item.value) === planId);
  return matched?.label || String(planId);
}

/**
 * 加载租户列表数据
 */
function fetchData(): void {
  loading.value = true;
  TenantAPI.getPage(queryParams)
    .then((data) => {
      pageData.value = data.list.map((item: TenantItem) => ({
        ...item,
        planId: item.planId != null ? Number(item.planId) : undefined,
      }));
      total.value = data.total ?? 0;
    })
    .finally(() => {
      loading.value = false;
    });
}

/**
 * 打开更换套餐弹窗
 */
async function openTenantPlanDialog(row: TenantItem): Promise<void> {
  const tenantId = row.id;
  if (tenantId == null || tenantId === "") return;
  if (isPlatformTenantId(tenantId)) return;

  tenantPlanSelectVisible.value = true;
  loading.value = true;
  planPreviewKeywords.value = "";
  planPreviewExpanded.value = false;
  menuKeywords.value = "";
  menuExpanded.value = false;
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
 * 关闭套餐选择弹窗
 */
function closeTenantPlanSelectDialog(): void {
  resetTenantPlanState();
}

/**
 * 关闭套餐功能配置抽屉
 */
function closeTenantPlanDialog(): void {
  resetTenantPlanState();
}

/**
 * 重置套餐相关的所有状态
 */
function resetTenantPlanState(): void {
  tenantPlanDialogVisible.value = false;
  tenantPlanSelectVisible.value = false;
  planPreviewKeywords.value = "";
  planPreviewExpanded.value = false;
  menuKeywords.value = "";
  menuExpanded.value = false;
  menuParentChildLinked.value = true;
  originalEnabledMenuIds.value = [];
  tenantPlanId.value = undefined;
  planMenuIds.value = [];
  tenantMenuIds.value = [];
  planPreviewOptions.value = [];
  menuPermOptions.value = [];
  menuSourceOptions.value = [];
  menuCheckedCount.value = 0;
  checkedTenant.value = {};
  checkedTenantForm.value = null;
  menuTreeRef.value?.setCheckedKeys([], false);
}

/**
 * 切换目标套餐时更新可用菜单
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

// 根据套餐范围同步勾选菜单
function updateCheckedMenus() {
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
 * 更新已勾选菜单数量
 */
function handleMenuCheckedChange(): void {
  const checkedKeys = menuTreeRef.value?.getCheckedKeys(false) || [];
  menuCheckedCount.value = checkedKeys.length;
}

/**
 * 打开套餐功能配置抽屉
 */
async function openTenantCustomizeDialog(row?: TenantItem): Promise<void> {
  const tenantId = row?.id ?? checkedTenant.value.id;
  if (!tenantId) return;
  if (isPlatformTenantId(tenantId)) return;

  loading.value = true;
  planPreviewKeywords.value = "";
  planPreviewExpanded.value = false;
  menuKeywords.value = "";
  menuExpanded.value = false;
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
 * 提交更换套餐操作
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
 * 过滤菜单树，仅保留套餐允许的节点
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
 * 提交套餐功能配置更新
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
      const menuIds: number[] = menuTreeRef.value
        ? (menuTreeRef
            .value!.getCheckedNodes(false, true)
            .map((node: any) => Number(node.value)) as number[]) || []
        : planMenuIds.value;
      const filteredMenuIds: number[] = allowedMenuIdSet.size
        ? menuIds.filter((menuId: number) => allowedMenuIdSet.has(menuId))
        : menuIds;
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
 * 统一菜单ID为number并过滤无效值
 */
function normalizeMenuIds(menuIds: Array<number | string>): number[] {
  return menuIds.map((menuId) => Number(menuId)).filter((menuId) => !Number.isNaN(menuId));
}

/**
 * 递归设置菜单节点禁用状态
 */
function applyMenuOptionsDisabled(options: OptionItem[], disabled: boolean): OptionItem[] {
  return options.map((option) => ({
    ...option,
    disabled,
    children: option.children ? applyMenuOptionsDisabled(option.children, disabled) : undefined,
  }));
}

/**
 * 查询按钮点击事件
 */
function handleQuery(): void {
  queryParams.pageNum = 1;
  fetchData();
}

/**
 * 重置查询
 */
function handleResetQuery(): void {
  queryFormRef.value?.resetFields();
  queryParams.pageNum = 1;
  fetchData();
}

/**
 * 表格选择变化事件
 */
function handleSelectionChange(selection: TenantItem[]): void {
  ids.value = selection.map((item) => Number(item.id));
}

/**
 * 打开弹窗
 * @param tenantId 租户ID（编辑时传入）
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

/**
 * 关闭弹窗
 */
function closeDialog(): void {
  dialogState.visible = false;
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

/**
 * 提交表单
 */
const handleSubmit = useDebounceFn(async (): Promise<void> => {
  const valid = await dataFormRef.value?.validate().then(
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
 * 删除租户
 * @param tenantId 租户ID
 */
function handleDelete(tenantId?: string): void {
  const tenantIds = tenantId != null && tenantId !== "" ? tenantId : ids.value.join(",");
  if (!tenantIds) {
    ElMessage.warning("请勾选删除项");
    return;
  }

  ElMessageBox.confirm("确认删除选中的租户吗？", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    async () => {
      loading.value = true;
      try {
        await TenantAPI.deleteByIds(tenantIds);
        ElMessage.success("删除成功");
        handleResetQuery();
      } finally {
        loading.value = false;
      }
    },
    () => {
      // 用户取消
    }
  );
}

/**
 * 加载租户套餐选项
 */
async function fetchPlanOptions(): Promise<void> {
  const options = await TenantPlanAPI.getOptions();
  planOptions.value = options.map((item) => ({
    ...item,
    value: item.value != null ? Number(item.value) : item.value,
  }));
}

// 菜单搜索关键字联动过滤树
watch(menuKeywords, (val) => {
  menuTreeRef.value?.filter(val);
});

// 套餐预览搜索关键字联动过滤树
watch(planPreviewKeywords, (val) => {
  planPreviewTreeRef.value?.filter(val);
});

onMounted(() => {
  fetchData();
  fetchPlanOptions();
});
</script>

<style scoped lang="scss"></style>
