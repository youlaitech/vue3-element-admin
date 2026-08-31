<template>
  <el-dialog
    v-model="visible"
    :title="isPublished ? '入口管理' : '发布表单'"
    width="680px"
    @close="handleClose"
  >
    <el-steps :active="step" align-center finish-status="success">
      <el-step title="发布方式" />
      <el-step title="入口配置" />
      <el-step title="发布完成" />
    </el-steps>

    <!-- 第①步：发布方式选择（可单选可全选，已发布走"入口管理"跳过此步） -->
    <div v-if="step === 0" class="publish-method">
      <div
        class="method-card"
        :class="{ 'method-card--active': selectedMethods.includes('menu') }"
        @click="toggleMethod('menu')"
      >
        <div class="method-card__header">
          <el-icon :size="18" class="method-card__icon method-card__icon--menu">
            <Monitor />
          </el-icon>
          <div class="method-card__titles">
            <span class="method-card__name">系统内嵌</span>
            <span class="method-card__name-en">MENU</span>
          </div>
          <el-tag v-if="menuConfig?.menuId" size="small" type="success">已生成入口</el-tag>
        </div>
        <p class="method-card__desc">员工登录系统从侧边栏进入填写，需配置可见角色</p>
      </div>

      <div
        class="method-card"
        :class="{ 'method-card--active': selectedMethods.includes('share') }"
        @click="toggleMethod('share')"
      >
        <div class="method-card__header">
          <el-icon :size="18" class="method-card__icon method-card__icon--share"><Link /></el-icon>
          <div class="method-card__titles">
            <span class="method-card__name">对外分享</span>
            <span class="method-card__name-en">SHARE</span>
          </div>
          <el-tag v-if="isPublic === 1" size="small" type="success">已开启</el-tag>
        </div>
        <p class="method-card__desc">微信发链接或扫码即可填写，无需账号</p>
      </div>

      <div class="publish-method__tip">不确定？两种方式可同时开启</div>
    </div>

    <!-- 第②步：入口配置（内嵌/分享各自分区卡片，强化两种形态的视觉区分） -->
    <div v-else-if="step === 1" class="entry-config">
      <!-- 系统内嵌分区：左侧色条 + 图标标题 -->
      <section v-if="showMenuConfig" class="entry-section entry-section--menu">
        <header class="entry-section__header">
          <el-icon :size="16" class="entry-section__icon"><Monitor /></el-icon>
          <span class="entry-section__title">系统内嵌</span>
          <span class="entry-section__sub">登录后侧边栏菜单进入</span>
        </header>
        <el-form
          ref="menuFormRef"
          :model="menuForm"
          :rules="rules"
          label-width="80px"
          class="entry-section__form"
        >
          <el-form-item label="菜单名称" prop="menuName">
            <el-input
              v-model="menuForm.menuName"
              placeholder="侧边栏展示名称"
              maxlength="50"
              show-word-limit
            />
          </el-form-item>

          <el-form-item prop="parentId">
            <template #label>
              <div class="flex-y-center">
                上级菜单
                <el-tooltip placement="bottom">
                  <template #content>
                    留空时后端自动创建"表单中心"目录（挂在"动态表单"下）；仅目录类型可选
                  </template>
                  <el-icon class="ml-1 cursor-pointer">
                    <QuestionFilled />
                  </el-icon>
                </el-tooltip>
              </div>
            </template>
            <el-tree-select
              v-model="menuForm.parentId"
              placeholder="留空默认：表单中心"
              :data="catalogTree"
              filterable
              clearable
              check-strictly
              :render-after-expand="false"
              class="!w-full"
            />
          </el-form-item>

          <el-form-item prop="roleIds">
            <template #label>
              <div class="flex-y-center">
                可见角色
                <el-tooltip content="授权后无需再去角色管理分配菜单" placement="bottom">
                  <el-icon class="ml-1 cursor-pointer">
                    <QuestionFilled />
                  </el-icon>
                </el-tooltip>
              </div>
            </template>
            <el-select
              v-model="menuForm.roleIds"
              multiple
              collapse-tags
              collapse-tags-tooltip
              clearable
              filterable
              placeholder="不选时仅超级管理员可见"
              class="!w-full"
            >
              <el-option
                v-for="role in roleOptions"
                :key="role.value"
                :label="role.label"
                :value="role.value"
              />
              <template #header>
                <div class="role-select__header">
                  <el-button link size="small" @click="handleSelectAllRoles">全选</el-button>
                  <span class="role-select__count">
                    {{ menuForm.roleIds?.length ?? 0 }}/{{ roleOptions.length }}
                  </span>
                </div>
              </template>
            </el-select>
          </el-form-item>
        </el-form>
      </section>

      <!-- 对外分享分区 -->
      <section v-if="showShareConfig" class="entry-section entry-section--share">
        <header class="entry-section__header">
          <el-icon :size="16" class="entry-section__icon"><Link /></el-icon>
          <span class="entry-section__title">对外分享</span>
          <span class="entry-section__sub">匿名链接/二维码进入</span>
        </header>
        <el-form label-width="80px" class="entry-section__form">
          <el-form-item>
            <template #label>
              <div class="flex-y-center">
                公开访问
                <el-tooltip
                  content="开启后可通过链接匿名填写；关闭后已发出去的链接立即失效"
                  placement="bottom"
                >
                  <el-icon class="ml-1 cursor-pointer">
                    <QuestionFilled />
                  </el-icon>
                </el-tooltip>
              </div>
            </template>
            <el-switch v-model="shareEnabled" />
          </el-form-item>

          <el-form-item v-if="shareEnabled">
            <template #label>
              <div class="flex-y-center">
                分享链接
                <el-tooltip
                  content="公开链接无需登录即可提交，请勿在表单中收集敏感信息（如密码）"
                  placement="bottom"
                >
                  <el-icon class="ml-1 cursor-pointer">
                    <QuestionFilled />
                  </el-icon>
                </el-tooltip>
              </div>
            </template>
            <el-input :model-value="shareUrl" readonly size="default">
              <template #append>
                <el-button @click="handleCopyLink">复制</el-button>
              </template>
            </el-input>
          </el-form-item>
        </el-form>
      </section>
    </div>

    <!-- 第③步：发布完成汇总（与第②步同构的分区卡片） -->
    <div v-else-if="step === 2" class="entry-config">
      <section v-if="showMenuConfig" class="entry-section entry-section--menu">
        <header class="entry-section__header">
          <el-icon :size="16" class="entry-section__icon"><Monitor /></el-icon>
          <span class="entry-section__title">系统内嵌</span>
          <span class="entry-section__sub">已生效</span>
        </header>
        <div class="entry-summary">
          <div class="entry-summary__row">
            <span class="entry-summary__label">菜单位置</span>
            <el-breadcrumb separator="/">
              <el-breadcrumb-item v-for="name in menuBreadcrumb" :key="name">
                {{ name }}
              </el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="entry-summary__row">
            <span class="entry-summary__label">可见角色</span>
            <template v-if="grantedRoleNames.length">
              <el-tag
                v-for="name in grantedRoleNames"
                :key="name"
                size="small"
                type="info"
                effect="plain"
              >
                {{ name }}
              </el-tag>
            </template>
            <span v-else class="entry-summary__empty">未授权，仅超级管理员可见</span>
          </div>
          <el-button type="primary" class="entry-summary__action" @click="handleGoView">
            前往查看
          </el-button>
        </div>
      </section>

      <section v-if="shareResultVisible" class="entry-section entry-section--share">
        <header class="entry-section__header">
          <el-icon :size="16" class="entry-section__icon"><Link /></el-icon>
          <span class="entry-section__title">对外分享</span>
          <span class="entry-section__sub">已开启</span>
        </header>
        <div class="entry-summary entry-summary--share">
          <canvas ref="qrCanvasRef" class="entry-summary__qrcode" />
          <div class="entry-summary__link">
            <el-link type="primary" :href="shareUrl" target="_blank">{{ shareUrl }}</el-link>
            <el-button size="small" @click="handleCopyLink">复制链接</el-button>
          </div>
          <div class="entry-summary__tip">扫码或复制链接分享，微信打开即可填写</div>
        </div>
      </section>

      <div class="publish-result__subtitle">{{ resultSubtitle }}</div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <template v-if="step === 0">
          <el-button type="primary" :disabled="!selectedMethods.length" @click="step = 1">
            下一步
          </el-button>
          <el-button @click="visible = false">取 消</el-button>
        </template>
        <template v-else-if="step === 1">
          <el-button v-if="!isPublished" @click="step = 0">上一步</el-button>
          <el-button type="primary" :loading="saving" @click="handleSaveEntry">
            {{ saveButtonLabel }}
          </el-button>
          <el-button @click="visible = false">取 消</el-button>
        </template>
        <template v-else>
          <el-button type="primary" @click="visible = false">完 成</el-button>
        </template>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { Link, Monitor, QuestionFilled } from "@element-plus/icons-vue";
import QRCode from "qrcode";

import FormAPI from "@/api/form";
import type { FormMenuConfig, FormMenuFormData } from "@/api/form";
import MenuAPI from "@/api/system/menu";
import type { MenuItem } from "@/api/system/menu";
import RoleAPI from "@/api/system/role";
import type { OptionItem } from "@/api/common";
import router from "@/router";
import { usePermissionStore } from "@/stores";
import { FormStatus } from "@/enums";

defineOptions({
  name: "FormPublishDialog",
});

const props = defineProps<{
  /** 表单ID */
  formId: string;
  /** 表单唯一标识 */
  formKey: string;
  /** 表单名称（菜单名称默认值） */
  formName: string;
  /** 表单状态(0草稿 1已发布 -1已停用)：已发布走"入口管理"语义，跳过方式选择 */
  status: number;
  /** 是否允许匿名公开访问(0否 1是)：分享配置回显 */
  isPublic?: number;
}>();

const emit = defineEmits(["success"]);

const visible = defineModel("modelValue", {
  type: Boolean,
  required: true,
  default: false,
});

/** 表单是否已发布（决定向导模式：发布流程 / 入口管理直达第②步） */
const isPublished = computed(() => props.status === FormStatus.PUBLISHED);

/** 发布方式 */
type PublishMethod = "menu" | "share";

/** 选中的发布方式（第①步卡片切换，可单选可全选） */
const selectedMethods = ref<PublishMethod[]>(["menu"]);

/** 目录类型标识（sys_menu.type：C 目录） */
const MENU_TYPE_CATALOG = "C";

/** 默认挂载目录名称：挂在"动态表单"目录下，管理菜单不授权给填写角色即不渲染 */
const DEFAULT_CATALOG_NAME = "表单中心";

/** 目录树节点（el-tree-select 数据源） */
interface CatalogNode {
  value: string;
  label: string;
  routePath?: string;
  children?: CatalogNode[];
}

const menuFormRef = ref<FormInstance>();
const step = ref(0);
const saving = ref(false);

/** 已生成的菜单配置（回显，未生成过为 null） */
const menuConfig = ref<FormMenuConfig | null>(null);

/** 公开访问开关（分享配置） */
const shareEnabled = ref(false);

/** 分享二维码画布 */
const qrCanvasRef = ref<HTMLCanvasElement>();

const catalogTree = ref<CatalogNode[]>([]);
const roleOptions = ref<OptionItem[]>([]);

const initialMenuForm: FormMenuFormData = {
  menuName: "",
  parentId: "",
  roleIds: [],
};

const menuForm = reactive<FormMenuFormData>({ ...initialMenuForm, roleIds: [] });

/**
 * 是否展示菜单入口配置块：
 * 已发布（入口管理）统一管理两种入口；未发布按第①步所选方式渲染
 */
const showMenuConfig = computed(() =>
  isPublished.value ? true : selectedMethods.value.includes("menu")
);

/** 是否展示分享入口配置块 */
const showShareConfig = computed(() =>
  isPublished.value ? true : selectedMethods.value.includes("share")
);

/** 菜单表单校验规则：菜单名称必填；上级菜单留空 = 默认目录"表单中心"（后端自动创建） */
const rules = computed<FormRules<FormMenuFormData>>(() =>
  showMenuConfig.value
    ? {
        menuName: [{ required: true, message: "请输入菜单名称", trigger: "blur" }],
      }
    : {}
);

/** 保存按钮文案（按配置的入口组合动态变化） */
const saveButtonLabel = computed(() => {
  if (isPublished.value) return "保存配置";
  return showMenuConfig.value ? "发布并生成入口" : "发布并开启分享";
});

/** 分享链接（hash 路由：origin + pathname + #/f/formKey） */
const shareUrl = computed(
  () => `${window.location.origin}${window.location.pathname}#/f/${props.formKey}`
);

/** 第③步分享汇总可见：本次配置了分享且公开开关开启 */
const shareResultVisible = computed(() => showShareConfig.value && shareEnabled.value);

/** 第③步副标题 */
const resultSubtitle = computed(() => {
  if (showMenuConfig.value && shareResultVisible.value)
    return "员工可从侧边栏进入，也可通过分享链接填写";
  if (showMenuConfig.value) return "员工刷新页面后即可从侧边栏进入填写";
  return "通过分享链接或扫码即可填写";
});

watch(visible, async (newVisible) => {
  if (!newVisible) return;
  // 已发布表单的"入口管理"：直达入口配置步骤；未发布走三步向导
  step.value = isPublished.value ? 1 : 0;
  await loadWizardData();
});

/**
 * 加载向导数据：目录树、角色选项、已生成菜单配置回显
 */
async function loadWizardData(): Promise<void> {
  const [menuTree, roles, menu] = await Promise.all([
    MenuAPI.getList({}),
    RoleAPI.getOptions(),
    FormAPI.getFormMenu(props.formId),
  ]);
  catalogTree.value = buildCatalogTree(menuTree);
  roleOptions.value = roles;

  // 回显已生成的菜单配置；未生成过时菜单名默认表单名、父级默认"表单中心"
  menuConfig.value = menu;
  Object.assign(menuForm, {
    menuName: menu?.menuName ?? props.formName,
    parentId: menu?.parentId ?? findDefaultCatalogId(),
    roleIds: menu?.roleIds ? [...menu.roleIds] : [],
  });
  // 回显公开开关（列表行传入，未开启过为 0）
  shareEnabled.value = props.isPublic === 1;
}

/**
 * 切换发布方式选中态（可单选可全选）
 *
 * @param method 发布方式
 */
function toggleMethod(method: PublishMethod): void {
  const index = selectedMethods.value.indexOf(method);
  if (index > -1) {
    selectedMethods.value.splice(index, 1);
  } else {
    selectedMethods.value.push(method);
  }
}

/** 角色全选（多选下拉 header 快捷操作） */
function handleSelectAllRoles(): void {
  menuForm.roleIds = roleOptions.value.map((role) => String(role.value));
}

/**
 * 构建目录树（仅目录类型可挂载表单菜单）
 *
 * @param menus 菜单树
 */
function buildCatalogTree(menus: MenuItem[]): CatalogNode[] {
  return menus
    .filter((menu) => menu.type === MENU_TYPE_CATALOG)
    .map((menu) => ({
      value: String(menu.id ?? ""),
      label: String(menu.name ?? ""),
      routePath: menu.routePath,
      children: menu.children?.length ? buildCatalogTree(menu.children) : undefined,
    }));
}

/**
 * 查找默认挂载目录ID：递归查找"表单中心"（已生成过则预选）；不存在返回空串（留空=后端自动创建）
 */
function findDefaultCatalogId(): string {
  const find = (nodes: CatalogNode[]): string => {
    for (const node of nodes) {
      if (node.label === DEFAULT_CATALOG_NAME) {
        return node.value;
      }
      if (node.children?.length) {
        const hit = find(node.children);
        if (hit) return hit;
      }
    }
    return "";
  };
  return find(catalogTree.value);
}

/**
 * 菜单路径面包屑：选中目录的名称链 + 菜单名称
 * 留空（默认目录）时展示后端实际挂载位置：动态表单 / 表单中心
 */
const menuBreadcrumb = computed(() => {
  if (!menuForm.parentId) {
    return ["动态表单", DEFAULT_CATALOG_NAME, menuForm.menuName];
  }
  const names: string[] = [];
  const find = (nodes: CatalogNode[], chain: string[]): boolean => {
    for (const node of nodes) {
      const nextChain = [...chain, node.label];
      if (node.value === menuForm.parentId) {
        names.push(...nextChain);
        return true;
      }
      if (node.children?.length && find(node.children, nextChain)) return true;
    }
    return false;
  };
  find(catalogTree.value, []);
  return [...names, menuForm.menuName];
});

/**
 * 已授权角色名称列表
 */
const grantedRoleNames = computed(() =>
  roleOptions.value
    .filter((role) => menuForm.roleIds?.includes(String(role.value)))
    .map((role) => role.label)
);

/**
 * 生成菜单的完整路由路径：目录路径链 + 表单标识
 * 留空（默认目录）时为后端标准挂载位置：/form/center/{formKey}
 */
const menuRoutePath = computed(() => {
  if (!menuForm.parentId) {
    return `/form/center/${props.formKey}`;
  }
  let routePath = "";
  const find = (nodes: CatalogNode[], basePath: string): boolean => {
    for (const node of nodes) {
      // 顶级目录 routePath 以 / 开头，子级为相对段
      const fullPath = node.routePath?.startsWith("/")
        ? node.routePath
        : `${basePath}/${node.routePath ?? ""}`;
      if (node.value === menuForm.parentId) {
        routePath = `${fullPath}/${props.formKey}`;
        return true;
      }
      if (node.children?.length && find(node.children, fullPath)) return true;
    }
    return false;
  };
  find(catalogTree.value, "");
  return routePath;
});

/**
 * 保存入口配置：未发布表单先发布（版本+1），再按所选方式生成菜单/保存公开开关
 */
async function handleSaveEntry(): Promise<void> {
  if (showMenuConfig.value) {
    const valid = await menuFormRef.value?.validate().then(
      () => true,
      () => false
    );
    if (!valid) return;
  }

  saving.value = true;
  try {
    if (!isPublished.value) {
      await FormAPI.publish(props.formId);
    }
    if (showMenuConfig.value) {
      await FormAPI.saveFormMenu(props.formId, {
        menuName: menuForm.menuName,
        // 留空不传：后端自动使用/创建默认目录"表单中心"
        parentId: menuForm.parentId || undefined,
        roleIds: menuForm.roleIds,
      });
    }
    if (showShareConfig.value) {
      // isPublic 独立提交：仅配置分享入口时才写开关，避免菜单-only 保存意外重置公开状态
      await FormAPI.update(props.formId, { isPublic: shareEnabled.value ? 1 : 0 });
    }
    step.value = 2;
    emit("success");
  } finally {
    saving.value = false;
  }
}

/**
 * 第③步分享汇总渲染后绘制二维码（canvas 随 v-if 挂载，需等 DOM 就绪）
 */
watch(step, async (newStep) => {
  if (newStep !== 2 || !shareResultVisible.value) return;
  await nextTick();
  if (qrCanvasRef.value) {
    await QRCode.toCanvas(qrCanvasRef.value, shareUrl.value, { width: 140, margin: 1 });
  }
});

/**
 * 复制分享链接
 */
function handleCopyLink(): void {
  navigator.clipboard
    ?.writeText(shareUrl.value)
    .then(() => ElMessage.success("链接已复制"))
    .catch(() => ElMessage.warning("复制失败，请手动复制"));
}

/**
 * 前往查看：重载动态路由（菜单为新建，当前路由表未包含）后跳转
 */
async function handleGoView(): Promise<void> {
  if (!menuRoutePath.value) {
    ElMessage.warning("未能解析菜单路径，请刷新页面后从侧边栏进入");
    return;
  }
  const permissionStore = usePermissionStore();
  await permissionStore.reloadRoutes();
  visible.value = false;
  router.push(menuRoutePath.value);
}

/**
 * 关闭向导并重置步骤
 */
function handleClose(): void {
  step.value = 0;
}
</script>

<style lang="scss" scoped>
/* ============ 第①步：发布方式卡片 ============ */
.publish-method {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px 16px 0;
}

.method-card {
  padding: 16px;
  cursor: pointer;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  transition: border-color 0.2s;

  &:hover {
    border-color: var(--el-color-primary-light-5);
  }

  &--active {
    background-color: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary);
  }

  &__header {
    display: flex;
    gap: 10px;
    align-items: center;
    font-size: 15px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  &__titles {
    display: flex;
    gap: 6px;
    align-items: baseline;
  }

  &__name-en {
    font-size: 11px;
    font-weight: 400;
    color: var(--el-text-color-placeholder);
    letter-spacing: 1px;
  }

  &__icon {
    &--menu {
      color: var(--el-color-primary);
    }

    &--share {
      color: var(--el-color-success);
    }
  }

  &__desc {
    margin: 8px 0 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
}

.publish-method__tip {
  padding: 8px 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  text-align: center;
}

/* ============ 第②/③步：入口分区卡片 ============ */
.entry-config {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px 16px 0;
}

/* 分区卡片：左侧 3px 色条区分两种形态（蓝=内嵌 绿=分享） */
.entry-section {
  padding: 0 0 4px;
  overflow: hidden;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;

  &--menu {
    border-left: 3px solid var(--el-color-primary);
  }

  &--share {
    border-left: 3px solid var(--el-color-success);
  }

  &__header {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 10px 14px;
    background-color: var(--el-fill-color-light);
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  &__icon {
    color: var(--el-text-color-secondary);
  }

  &--menu &__icon {
    color: var(--el-color-primary);
  }

  &--share &__icon {
    color: var(--el-color-success);
  }

  &__title {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  &__sub {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  &__form {
    padding: 16px 14px 0;
  }
}

/* 角色多选下拉 header：全选 + 计数 */
.role-select__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.role-select__count {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

/* ============ 第③步：分区汇总 ============ */
.entry-summary {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 14px 12px;

  &__row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    font-size: 13px;
  }

  &__label {
    width: 60px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  &__empty {
    font-size: 13px;
    color: var(--el-text-color-placeholder);
  }

  &__action {
    align-self: flex-start;
    margin-left: 60px;
  }

  &--share {
    align-items: center;
  }

  &__qrcode {
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 6px;
  }

  &__link {
    display: flex;
    gap: 8px;
    align-items: center;
    max-width: 100%;
  }

  &__tip {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}

.publish-result__subtitle {
  padding: 8px 0 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  text-align: center;
}
</style>
