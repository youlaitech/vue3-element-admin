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

    <!-- 第①步：发布方式选择（已发布走"入口管理"跳过此步） -->
    <MethodStep
      v-if="step === 0"
      :selected="selectedMethods"
      :menu-generated="!!menuConfig?.menuId"
      :share-opened="isPublic === 1"
      @toggle="toggleMethod"
    />

    <!-- 第②步：入口配置 -->
    <EntryConfigStep
      v-else-if="step === 1"
      ref="entryConfigRef"
      v-model:menu-form="menuForm"
      v-model:share-enabled="shareEnabled"
      :show-menu="showMenuConfig"
      :show-share="showShareConfig"
      :catalog-tree="catalogTree"
      :role-options="roleOptions"
      :share-url="shareUrl"
      @copy="handleCopyLink"
    />

    <!-- 第③步：发布完成汇总 -->
    <PublishResultStep
      v-else-if="step === 2"
      :show-menu="showMenuConfig"
      :menu-breadcrumb="menuBreadcrumb"
      :granted-role-names="grantedRoleNames"
      :share-visible="shareResultVisible"
      :share-url="shareUrl"
      :subtitle="resultSubtitle"
      @go-view="handleGoView"
      @copy="handleCopyLink"
    />

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
import { ElMessage } from "element-plus";

import FormAPI from "@/api/form";
import type { FormMenuConfig, FormMenuFormData } from "@/api/form";
import MenuAPI from "@/api/system/menu";
import type { MenuItem } from "@/api/system/menu";
import RoleAPI from "@/api/system/role";
import type { OptionItem } from "@/api/common";
import router from "@/router";
import { usePermissionStore } from "@/stores";
import { FormStatus } from "@/enums";
import MethodStep from "./publish/MethodStep.vue";
import EntryConfigStep from "./publish/EntryConfigStep.vue";
import PublishResultStep from "./publish/PublishResultStep.vue";
import type { CatalogNode, PublishMethod } from "./publish/types";

defineOptions({
  name: "FormPublishDialog",
});

/**
 * 表单发布/入口管理向导容器
 *
 * @description 三步向导（方式选择 → 入口配置 → 发布完成）的状态与编排容器：
 * 数据加载、保存编排（发布 → 生成菜单 → 保存公开开关）在容器完成，
 * 各步骤展示细节由 publish/ 目录下的步骤组件承担
 */
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

/** 当前向导步骤 */
const step = ref(0);

/** 保存中状态 */
const saving = ref(false);

/** 选中的发布方式（可单选可全选） */
const selectedMethods = ref<PublishMethod[]>(["menu"]);

/** 已生成的菜单配置（回显，未生成过为 null） */
const menuConfig = ref<FormMenuConfig | null>(null);

/** 公开访问开关（分享配置） */
const shareEnabled = ref(false);

const catalogTree = ref<CatalogNode[]>([]);
const roleOptions = ref<OptionItem[]>([]);

/** 菜单入口配置表单数据（第②步编辑，保存时读取） */
const menuForm = reactive<FormMenuFormData>({ menuName: "", parentId: "", roleIds: [] });

/** 第②步组件实例（校验入口） */
const entryConfigRef = ref<InstanceType<typeof EntryConfigStep>>();

/** 目录类型标识（sys_menu.type：C 目录） */
const MENU_TYPE_CATALOG = "C";

/** 默认挂载目录名称：挂在"动态表单"目录下，管理菜单不授权给填写角色即不渲染 */
const DEFAULT_CATALOG_NAME = "表单中心";

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

/** 已授权角色名称列表 */
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
    const valid = (await entryConfigRef.value?.validate()) ?? true;
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
