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

/** 发布/入口管理三步向导容器 */
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

/** 表单是否已发布（已发布直达入口配置步骤） */
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

/** 默认挂载目录名称 */
const DEFAULT_CATALOG_NAME = "表单中心";

/** 是否展示菜单入口配置块（已发布恒显示，未发布按第①步所选） */
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

/** 第③步分享汇总可见（配置了分享且开关开启） */
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

// 加载目录树、角色选项与已生成菜单配置
async function loadWizardData(): Promise<void> {
  const [menuTree, roles, menu] = await Promise.all([
    MenuAPI.getList({}),
    RoleAPI.getOptions(),
    FormAPI.getFormMenu(props.formId),
  ]);
  catalogTree.value = buildCatalogTree(menuTree);
  roleOptions.value = roles;

  // 未生成过菜单时：名称默认表单名、父级默认"表单中心"
  menuConfig.value = menu;
  Object.assign(menuForm, {
    menuName: menu?.menuName ?? props.formName,
    parentId: menu?.parentId ?? findDefaultCatalogId(),
    roleIds: menu?.roleIds ? [...menu.roleIds] : [],
  });
  // 回显公开开关
  shareEnabled.value = props.isPublic === 1;
}

/**
 * 切换发布方式选中态
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

// 递归查找"表单中心"目录ID；不存在返回空串（留空由后端自动创建）
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

/** 菜单位置面包屑（目录名称链 + 菜单名） */
const menuBreadcrumb = computed(() => {
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

/** 菜单完整路由路径（目录路径链 + 表单标识） */
const menuRoutePath = computed(() => {
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

// 保存入口配置：未发布先发布，再生成菜单/保存公开开关
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
        parentId: menuForm.parentId,
        roleIds: menuForm.roleIds,
      });
    }
    if (showShareConfig.value) {
      // isPublic 独立提交，避免菜单-only 保存意外重置公开状态
      // formKey/formName 原样回传满足后端非空校验（已发布态后端不更新元数据）
      await FormAPI.update(props.formId, {
        formKey: props.formKey,
        formName: props.formName,
        isPublic: shareEnabled.value ? 1 : 0,
      });
    }
    step.value = 2;
    emit("success");
  } finally {
    saving.value = false;
  }
}

// 复制分享链接
function handleCopyLink(): void {
  navigator.clipboard
    ?.writeText(shareUrl.value)
    .then(() => ElMessage.success("链接已复制"))
    .catch(() => ElMessage.warning("复制失败，请手动复制"));
}

// 重载动态路由（新建菜单需重新拉取路由表）后跳转
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

// 关闭向导并重置步骤
function handleClose(): void {
  step.value = 0;
}
</script>
