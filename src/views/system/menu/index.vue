<template>
  <div class="page-container">
    <el-card class="page-search" shadow="never">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="关键字" prop="keywords">
          <el-input
            v-model="queryParams.keywords"
            placeholder="菜单名称"
            clearable
            @keyup.enter="handleQuery"
          />
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
          <el-button v-hasPerm="['sys:menu:create']" type="primary" @click="openDialog()">
            新增菜单
          </el-button>
        </div>
        <div class="page-toolbar__right">
          <el-tooltip :content="expandAll ? '折叠全部' : '展开全部'" placement="top">
            <el-button class="page-icon-btn" @click="toggleExpandAll">
              <span v-if="expandAll" class="i-svg:checkbox-indeterminate" />
              <span v-else class="i-svg:add-box" />
            </el-button>
          </el-tooltip>
          <el-divider class="page-toolbar__divider" direction="vertical" />
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
          ref="tableRef"
          v-loading="loading"
          class="page-table"
          border
          row-key="id"
          :data="list"
          height="100%"
          :indent="28"
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        >
          <el-table-column class-name="menu-name-column" label="菜单名称" min-width="200">
            <template #default="scope">
              <div class="menu-name-cell">
                <span
                  class="menu-name-cell__icon"
                  :class="{
                    'is-default': !scope.row.icon && scope.row.type !== MenuTypeEnum.BUTTON,
                  }"
                >
                  <el-icon v-if="scope.row.icon?.startsWith('el-icon')">
                    <component :is="scope.row.icon.replace('el-icon-', '')" />
                  </el-icon>
                  <span v-else :class="getMenuIconClass(scope.row)" />
                </span>
                <span
                  class="menu-name-cell__text"
                  :class="{ 'is-catalog': scope.row.type === MenuTypeEnum.CATALOG }"
                >
                  {{ scope.row.name }}
                </span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="类型" align="center" width="80">
            <template #default="scope">
              <el-tag v-if="scope.row.type === MenuTypeEnum.CATALOG" type="warning">目录</el-tag>
              <el-tag v-if="scope.row.type === MenuTypeEnum.MENU" type="success">菜单</el-tag>
              <el-tag v-if="scope.row.type === MenuTypeEnum.EXTERNAL" type="primary">外链</el-tag>
              <el-tag v-if="scope.row.type === MenuTypeEnum.BUTTON" type="danger">按钮</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="访问地址" align="left" min-width="200">
            <template #default="scope">
              <div class="menu-address-cell">
                <a
                  v-if="scope.row.type === MenuTypeEnum.EXTERNAL && scope.row.externalUrl"
                  class="menu-address-cell__link"
                  :href="scope.row.externalUrl"
                  :title="scope.row.externalUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {{ scope.row.externalUrl }}
                </a>
                <span v-else class="menu-address-cell__text" :title="getMenuAccessPath(scope.row)">
                  {{ getMenuAccessPath(scope.row) }}
                </span>
                <CopyButton
                  v-if="scope.row.type === MenuTypeEnum.EXTERNAL"
                  :text="scope.row.externalUrl || ''"
                  :style="{ flex: 'none', padding: '0 2px' }"
                />
              </div>
            </template>
          </el-table-column>
          <el-table-column label="页面路径" align="left" min-width="180">
            <template #default="scope">
              <span class="menu-cell-ellipsis" :title="getMenuComponentPath(scope.row)">
                {{ getMenuComponentPath(scope.row) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            label="权限标识"
            align="center"
            width="200"
            show-overflow-tooltip
            prop="perm"
          />
          <el-table-column v-if="showMenuScope" label="范围" align="center" width="100">
            <template #default="scope">
              <el-tag v-if="scope.row.scope === MenuScopeEnum.PLATFORM" type="danger">平台</el-tag>
              <el-tag v-else type="success">业务</el-tag>
            </template>
          </el-table-column>

          <el-table-column label="状态" align="center" width="80">
            <template #default="scope">
              <el-tag v-if="scope.row.visible === CommonStatus.ENABLED" type="success">显示</el-tag>
              <el-tag v-else type="info">隐藏</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="排序" align="center" width="80" prop="sort" />
          <el-table-column fixed="right" align="center" label="操作" width="220">
            <template #default="scope">
              <el-button
                v-if="
                  scope.row.type === MenuTypeEnum.CATALOG || scope.row.type === MenuTypeEnum.MENU
                "
                v-hasPerm="['sys:menu:create']"
                type="primary"
                link
                size="small"
                @click.stop="openDialog(scope.row.id)"
              >
                {{ scope.row.type === MenuTypeEnum.MENU ? "新增按钮" : "新增子级" }}
              </el-button>

              <el-button
                v-hasPerm="['sys:menu:update']"
                type="primary"
                link
                size="small"
                @click.stop="openDialog(undefined, scope.row.id)"
              >
                编辑
              </el-button>
              <el-button
                v-hasPerm="['sys:menu:delete']"
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

    <el-drawer
      v-model="dialogState.visible"
      :title="dialogState.title"
      :size="drawerSize"
      @close="resetForm"
    >
      <el-form
        ref="menuFormRef"
        class="menu-form"
        :model="formData"
        :rules="rules"
        label-width="96px"
      >
        <el-form-item label="菜单类型" prop="type" class="menu-type-item">
          <div class="menu-type-control">
            <el-segmented
              v-model="formData.type"
              :options="typeOptions"
              :disabled="typeLocked"
              block
              @change="handleTypeChange"
            >
              <template #default="{ item }">
                <span class="menu-type-option">
                  <el-icon class="menu-type-option__icon"><component :is="item.icon" /></el-icon>
                  <span>{{ item.label }}</span>
                </span>
              </template>
            </el-segmented>
            <div v-if="typeLocked" class="menu-form__tip">{{ typeLockedTip }}</div>
          </div>
        </el-form-item>

        <div class="menu-preview">
          <el-icon class="menu-preview__icon"><Position /></el-icon>
          <span>{{ previewText }}</span>
        </div>

        <SectionTitle title="基础信息" />

        <el-form-item label="菜单名称" prop="name">
          <div class="menu-form__field">
            <div class="menu-form__row">
              <el-input v-model="formData.name" placeholder="侧边栏上显示的名字，如 用户管理" />
              <el-tooltip
                v-if="appConfig.aiEnabled && !isExternal"
                :content="aiTip"
                placement="top"
              >
                <span class="menu-form__tip-trigger">
                  <el-button
                    link
                    type="primary"
                    :loading="aiLoading"
                    :disabled="!formData.name?.trim()"
                    @click="handleAiFill"
                  >
                    <template #icon><span class="i-svg:ai" /></template>
                    {{ aiLoading ? "推断中" : "推断" }}
                  </el-button>
                </span>
              </el-tooltip>
            </div>
            <div v-if="aiFilledTip" class="menu-form__tip">
              {{ aiFilledTip }}
              <el-button class="menu-form__undo" link type="primary" @click="handleAiUndo">
                撤销
              </el-button>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="上级菜单" prop="parentId">
          <el-tree-select
            v-model="formData.parentId"
            placeholder="选择上级菜单"
            :data="menuOptions"
            :props="parentOptionProps"
            filterable
            default-expand-all
            check-strictly
            :render-after-expand="false"
          />
        </el-form-item>

        <SectionTitle v-if="showRoutePath || isExternal" title="访问配置" />

        <template v-if="isExternal">
          <el-form-item label="外链地址" prop="externalUrl">
            <el-input v-model="formData.externalUrl" placeholder="https://example.com" clearable />
          </el-form-item>

          <el-form-item label="打开方式">
            <el-radio-group v-model="externalMode" @change="handleExternalModeChange">
              <el-radio value="blank">新标签页</el-radio>
              <el-radio value="iframe">系统内嵌</el-radio>
            </el-radio-group>
          </el-form-item>
        </template>

        <el-form-item v-if="showRoutePath" prop="routePath">
          <template #label>
            <span class="menu-form__label">
              访问路径
              <el-tooltip
                content="浏览器地址栏里的路径，只填当前这一段（如 user），上级路径会自动拼接"
                placement="bottom"
              >
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
            </span>
          </template>
          <div class="menu-form__field">
            <el-input
              v-model="formData.routePath"
              :placeholder="isCatalog ? '如 report' : '如 user'"
            />
            <div v-if="fullRoutePath" class="menu-form__tip">
              访问地址
              <span class="menu-form__path">{{ fullRoutePath }}</span>
            </div>
          </div>
        </el-form-item>

        <el-form-item v-if="isPage" prop="component">
          <template #label>
            <span class="menu-form__label">
              页面路径
              <el-tooltip
                content="点开菜单时显示哪个页面；选中目录则用该目录的 index.vue，手动输入可不带 .vue 后缀"
                placement="bottom"
              >
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
            </span>
          </template>
          <div class="menu-form__field">
            <div class="menu-form__row">
              <el-tree-select
                v-if="!componentManual"
                v-model="formData.component"
                node-key="value"
                :data="pageComponentTree"
                :props="{ label: 'label', children: 'children' }"
                placeholder="如 system/user/index"
                filterable
                default-expand-all
                :filter-node-method="filterPageComponent"
                check-strictly
                :render-after-expand="false"
              />
              <el-input
                v-else
                v-model="formData.component"
                placeholder="system/user/index"
                @blur="handleComponentBlur"
              />
              <el-button
                class="menu-form__switch"
                link
                type="primary"
                @click="toggleComponentManual"
              >
                {{ componentManual ? "列表选择" : "手动输入" }}
              </el-button>
            </div>
            <div v-if="formData.component" class="menu-form__tip">
              <span class="menu-form__path">{{ componentFilePath }}</span>
            </div>
          </div>
        </el-form-item>

        <el-form-item v-if="isButton" prop="perm">
          <template #label>
            <span class="menu-form__label">
              权限标识
              <el-tooltip
                content="后端接口鉴权用的标识，格式 模块:资源:操作，与代码里的权限注解一一对应"
                placement="bottom"
              >
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
            </span>
          </template>
          <el-input v-model="formData.perm" placeholder="如 sys:user:create（新增用户）" />
        </el-form-item>

        <SectionTitle v-if="!isButton" title="展示设置" />

        <el-form-item v-if="!isButton" label="在侧边栏显示">
          <el-switch v-model="visibleSwitch" />
        </el-form-item>

        <el-form-item v-if="!isButton" label="菜单图标" prop="icon">
          <icon-select v-model="formData.icon" />
        </el-form-item>

        <el-form-item v-if="showMenuScope && !isButton" prop="scope">
          <template #label>
            <span class="menu-form__label">
              菜单范围
              <el-tooltip
                content="平台菜单只给平台端使用（如租户、套餐管理）；业务菜单可分配给租户"
                placement="bottom"
              >
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
            </span>
          </template>
          <el-radio-group v-model="formData.scope">
            <el-radio :value="MenuScopeEnum.PLATFORM">平台菜单</el-radio>
            <el-radio :value="MenuScopeEnum.TENANT">业务菜单</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input-number
            v-model="formData.sort"
            style="width: 120px"
            controls-position="right"
            :min="0"
          />
        </el-form-item>

        <el-collapse v-if="showAdvanced" v-model="advancedPanels" class="menu-form__advanced">
          <el-collapse-item :name="ADVANCED_PANEL">
            <template #title>高级设置</template>

            <el-form-item v-if="showKeepAlive" label="页面缓存">
              <el-radio-group v-model="formData.keepAlive" @change="handleKeepAliveChange">
                <el-radio :value="1">开启</el-radio>
                <el-radio :value="0">关闭</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item v-if="showRouteName" prop="routeName">
              <template #label>
                <span class="menu-form__label">
                  路由名称
                  <el-tooltip
                    content="程序内部定位这个页面用的唯一标识，一般不用改；留空会按访问地址自动生成"
                    placement="bottom"
                  >
                    <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip>
                </span>
              </template>
              <el-input
                v-model="formData.routeName"
                :placeholder="derivedRouteName || 'SystemUser'"
              />
            </el-form-item>

            <el-form-item v-if="isPage">
              <template #label>
                <span class="menu-form__label">
                  路由参数
                  <el-tooltip
                    content="打开页面时自动拼在地址栏后面的参数，如 id=1 会访问 /system/user?id=1"
                    placement="bottom"
                  >
                    <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip>
                </span>
              </template>
              <div v-if="!formData.params || formData.params.length === 0">
                <el-button type="primary" plain @click="formData.params = [{ key: '', value: '' }]">
                  添加参数
                </el-button>
              </div>

              <div v-else class="menu-param-list">
                <div v-for="(item, index) in formData.params" :key="index" class="menu-param-row">
                  <el-input v-model="item.key" placeholder="参数名" />
                  <span class="menu-param-row__equal">=</span>
                  <el-input v-model="item.value" placeholder="参数值" />

                  <el-icon
                    v-if="formData.params.indexOf(item) === formData.params.length - 1"
                    class="menu-param-row__action is-add"
                    @click="formData.params.push({ key: '', value: '' })"
                  >
                    <CirclePlusFilled />
                  </el-icon>
                  <el-icon
                    class="menu-param-row__action is-delete"
                    @click="formData.params.splice(formData.params.indexOf(item), 1)"
                  >
                    <DeleteFilled />
                  </el-icon>
                </div>
              </div>
            </el-form-item>

            <el-form-item v-if="isCatalog" label="默认跳转">
              <el-input v-model="formData.redirect" placeholder="留空自动跳转第一个可见子页面" />
            </el-form-item>

            <el-form-item v-if="isPage && !isEditing" label="按钮权限">
              <div class="menu-form__field">
                <el-checkbox v-model="formData.generateCrudButtons">生成增删改查按钮</el-checkbox>
                <el-input
                  v-if="formData.generateCrudButtons"
                  v-model="formData.buttonPermPrefix"
                  class="menu-form__prefix"
                  placeholder="权限前缀，如 sys:user"
                  @input="permPrefixAuto = false"
                />
              </div>
            </el-form-item>
          </el-collapse-item>
        </el-collapse>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button>
          <el-button @click="closeDialog">取消</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { useFullscreen } from "@vueuse/core";
import type { Component } from "vue";
import {
  ElMessage,
  ElMessageBox,
  type FormInstance,
  type FormRules,
  type TableInstance,
} from "element-plus";
import {
  CirclePlusFilled,
  DeleteFilled,
  Document,
  FolderOpened,
  FullScreen,
  Key,
  Link,
  Position,
  QuestionFilled,
  Refresh,
} from "@element-plus/icons-vue";

import MenuAPI from "@/api/system/menu";
import type { MenuForm, MenuItem, MenuQueryParams } from "@/api/system/menu";
import type { OptionItem } from "@/api/common";
import {
  filterPageComponent,
  isViewComponent,
  normalizeViewPath,
  pageComponentTree,
} from "@/router/views";
import { appConfig } from "@/settings";
import { useAppStore } from "@/stores/app";
import { usePermissionStore } from "@/stores/permission";
import { CommonStatus, MenuScopeEnum, MenuTypeEnum } from "@/enums";
import { DeviceEnum } from "@/enums/settings";
import { isTenantEnabled } from "@/utils/tenant";
import { isValidURL, joinRoutePath } from "@/utils";
import { matchIcon } from "@/utils/icon";

defineOptions({
  name: "SysMenu",
  inheritAttrs: false,
});

/** 外链打开方式 */
type ExternalMode = "blank" | "iframe";

/** 菜单类型选项 */
interface MenuTypeOption {
  value: MenuTypeEnum;
  label: string;
  icon: Component;
}

const MENU_TYPE_OPTIONS: MenuTypeOption[] = [
  { value: MenuTypeEnum.MENU, label: "页面", icon: Document },
  { value: MenuTypeEnum.CATALOG, label: "分组目录", icon: FolderOpened },
  { value: MenuTypeEnum.EXTERNAL, label: "外链", icon: Link },
  { value: MenuTypeEnum.BUTTON, label: "按钮权限", icon: Key },
];

const appStore = useAppStore();

const tableWrapperRef = ref<HTMLElement | null>(null);
const { toggle: toggleFullscreen } = useFullscreen(tableWrapperRef);

const queryFormRef = ref<FormInstance>();
const menuFormRef = ref<FormInstance>();

const loading = ref(false);
const list = ref<MenuItem[]>([]);
const tableRef = ref<TableInstance>();
// 是否展开全部菜单层级，默认折叠只显示顶级菜单
const expandAll = ref(false);
const queryParams = reactive<MenuQueryParams>({ keywords: "" });

const dialogState = reactive({
  title: "新增菜单",
  visible: false,
});

// AI 推断状态与结果提示
const aiLoading = ref(false);
const aiFilledTip = ref("");
// AI 推断前的字段值，供撤销恢复
let aiSnapshot: { routePath?: string; perm?: string; icon?: string } | null = null;

// 同级页面已有按钮的权限模块名，用于推导按钮权限前缀
const siblingPermModule = ref("");
// 按钮权限前缀是否由自动推导填入，用户手改后不再跟随访问路径
const permPrefixAuto = ref(false);

// 全量菜单树，供上级菜单选项、排序推算与层级校验使用
const parentMenuTree = ref<MenuItem[]>([]);
const componentManual = ref(false);
// 编辑前的组件值，历史数据可能已无对应文件，不做存在性校验
const originalComponent = ref<string>();
const externalMode = ref<ExternalMode>("blank");
// 高级设置折叠面板名称
const ADVANCED_PANEL = "advanced";
// 已展开的高级设置面板，默认展开
const advancedPanels = ref<string[]>([ADVANCED_PANEL]);

const initialFormData: MenuForm = {
  parentId: "0",
  visible: CommonStatus.ENABLED,
  scope: MenuScopeEnum.TENANT,
  type: MenuTypeEnum.MENU,
  keepAlive: 1,
  params: [],
  generateCrudButtons: false,
};

const formData = reactive<MenuForm>({ ...initialFormData });

// AI 推断按钮的提示文案，未填名称时说明置灰原因
const aiTip = computed(() =>
  formData.name?.trim() ? "根据菜单名称推断访问路径、权限标识" : "先填写菜单名称"
);

// 上级菜单选项，顶级节点下挂完整菜单树
const menuOptions = computed<OptionItem[]>(() => [
  { value: "0", label: "顶级菜单", children: toMenuOptions(parentMenuTree.value) },
]);

// 多租户关闭时隐藏菜单范围字段
const showMenuScope = computed(() => isTenantEnabled());

// 抽屉宽度（响应式）
const drawerSize = computed(() => (appStore.device === DeviceEnum.DESKTOP ? "600px" : "90%"));

const isEditing = computed(() => Boolean(formData.id));

const isTopLevel = computed(() => !formData.parentId || formData.parentId === "0");

const isCatalog = computed(() => formData.type === MenuTypeEnum.CATALOG);

const isPage = computed(() => formData.type === MenuTypeEnum.MENU);

const isExternal = computed(() => formData.type === MenuTypeEnum.EXTERNAL);

const isButton = computed(() => formData.type === MenuTypeEnum.BUTTON);

// 系统内嵌外链需要一个内部路由承载 iframe 页面
const isEmbeddedExternal = computed(() => isExternal.value && externalMode.value === "iframe");

const showRoutePath = computed(() => isCatalog.value || isPage.value || isEmbeddedExternal.value);

const showKeepAlive = computed(() => isPage.value || isEmbeddedExternal.value);

const showRouteName = computed(() => showKeepAlive.value && isStatusEnabled(formData.keepAlive));

const showAdvanced = computed(() => showKeepAlive.value || isCatalog.value || showRouteName.value);

// 按钮权限只能挂在页面下；已有菜单的类型不可修改
const typeOptions = computed(() => {
  if (isEditing.value) return MENU_TYPE_OPTIONS;
  return parentMenu.value?.type === MenuTypeEnum.MENU
    ? MENU_TYPE_OPTIONS.filter((item) => item.value === MenuTypeEnum.BUTTON)
    : MENU_TYPE_OPTIONS.filter((item) => item.value !== MenuTypeEnum.BUTTON);
});

const typeLocked = computed(() => isEditing.value || typeOptions.value.length === 1);

// 类型被锁定的原因：编辑时不可改类型；页面下新增只能挂按钮
const typeLockedTip = computed(() =>
  isEditing.value ? "类型创建后不可修改" : "页面下只能挂按钮权限"
);

const visibleSwitch = computed({
  get: () => formData.visible !== CommonStatus.DISABLED,
  set: (value: boolean) => {
    formData.visible = value ? CommonStatus.ENABLED : CommonStatus.DISABLED;
  },
});

const parentMenu = computed(() => findMenuById(parentMenuTree.value, formData.parentId));

// 上级菜单选项：编辑时禁用自身及其下级，与当前类型不兼容的节点也禁用
const parentOptionProps = computed(() => ({
  label: "label",
  children: "children",
  disabled: (data: { value?: string }) => {
    if (isMenuInSubtree(findMenuById(parentMenuTree.value, formData.id), data.value)) {
      return true;
    }
    /**
     * 按钮挂页面下，其余类型挂目录或顶级；顶级不在菜单树里，取不到节点
     */
    const target = findMenuById(parentMenuTree.value, data.value);
    return formData.type === MenuTypeEnum.BUTTON
      ? target?.type !== MenuTypeEnum.MENU
      : target?.type === MenuTypeEnum.MENU;
  },
}));

// 新建时上级菜单可切换，可选类型随之变化：当前类型不再被允许时自动收敛
watch(
  () => formData.parentId,
  () => {
    if (isEditing.value) return;
    const allowed = typeOptions.value;
    if (allowed.some((item) => item.value === formData.type)) return;
    formData.type = allowed[0]?.value ?? MenuTypeEnum.MENU;
    handleTypeChange();
  }
);

// 勾选生成按钮时按同级已有按钮推导权限前缀，用户已填则不覆盖
watch(
  () => formData.generateCrudButtons,
  (checked) => {
    if (!checked || formData.buttonPermPrefix?.trim()) return;
    formData.buttonPermPrefix = deriveButtonPermPrefix();
    permPrefixAuto.value = true;
  }
);

// 前缀是推导来的就跟随访问路径刷新，用户手改过则不再变动
watch(
  () => formData.routePath,
  () => {
    if (permPrefixAuto.value) {
      formData.buttonPermPrefix = deriveButtonPermPrefix();
    }
  }
);

// 上级路径逐级拼接，得到当前菜单的完整访问地址
const parentPath = computed(() =>
  findMenuTrail(parentMenuTree.value, formData.parentId).reduce(
    (path, menu) => joinRoutePath(path, menu.routePath),
    ""
  )
);

const fullRoutePath = computed(() =>
  formData.routePath ? joinRoutePath(parentPath.value, formData.routePath) : ""
);

const derivedRouteName = computed(() =>
  fullRoutePath.value ? deriveRouteName(fullRoutePath.value) : ""
);

// 页面路径对应的文件位置，输入带 .vue 后缀也能正确展示
const componentFilePath = computed(() =>
  formData.component ? `src/views/${normalizeViewPath(formData.component)}.vue` : ""
);

const previewText = computed(() => {
  const name = formData.name?.trim() || "未命名";

  if (isButton.value) {
    return `挂在「${parentMenu.value?.name ?? ""}」下，权限标识 ${
      formData.perm?.trim() || "待填写"
    }`;
  }

  const position = isTopLevel.value ? "顶级" : `「${parentMenu.value?.name ?? ""}」下`;

  if (isExternal.value) {
    const openMode = isEmbeddedExternal.value ? "在系统内嵌显示" : "点击后新窗口打开";
    return `侧边栏${position}打开外部地址，${openMode}`;
  }

  if (isCatalog.value) {
    return `侧边栏${position}新增分组「${name}」，本身不占用页面`;
  }

  const address = fullRoutePath.value ? `，访问地址 ${fullRoutePath.value}` : "";
  return `侧边栏${position}新增一项「${name}」${address}`;
});

/**
 * 校验路由路径
 */
const validateRoutePath = (_: unknown, value: string, callback: (error?: Error) => void) => {
  if (showRoutePath.value && !value) {
    callback(new Error("请输入访问路径"));
    return;
  }
  callback();
};

/**
 * 校验组件路径
 */
const validateComponent = (_: unknown, value: string, callback: (error?: Error) => void) => {
  if (!isPage.value) {
    callback();
    return;
  }

  // 提示语随录入方式区分：手动输入时不说“选择”
  if (!value) {
    callback(new Error(componentManual.value ? "请输入页面路径" : "请选择页面"));
    return;
  }

  // 未改动的历史值跳过存在性校验，避免旧数据无法保存
  if (value !== originalComponent.value && !isViewComponent(value)) {
    callback(
      new Error(componentManual.value ? "页面不存在，请检查路径" : "页面不存在，请重新选择")
    );
    return;
  }

  callback();
};

/**
 * 校验外链地址
 */
const validateExternalUrl = (_: unknown, value: string, callback: (error?: Error) => void) => {
  if (!isExternal.value) {
    callback();
    return;
  }

  if (!value) {
    callback(new Error("请输入外链地址"));
    return;
  }

  if (!isValidURL(value)) {
    callback(new Error("请输入正确的外链地址"));
    return;
  }

  callback();
};

/**
 * 校验权限标识
 */
const validatePerm = (_: unknown, value: string, callback: (error?: Error) => void) => {
  if (isButton.value && !value) {
    callback(new Error("请输入权限标识"));
    return;
  }
  callback();
};

const rules: FormRules<MenuForm> = {
  type: [{ required: true, message: "请选择菜单类型", trigger: "change" }],
  parentId: [{ required: true, message: "请选择上级菜单", trigger: "change" }],
  name: [{ required: true, message: "请输入菜单名称", trigger: "blur" }],
  routePath: [{ validator: validateRoutePath, trigger: "blur" }],
  component: [{ validator: validateComponent, trigger: "change" }],
  externalUrl: [{ validator: validateExternalUrl, trigger: "blur" }],
  perm: [{ validator: validatePerm, trigger: "blur" }],
  scope: [{ required: true, message: "请选择菜单范围", trigger: "change" }],
};

/**
 * 拉取菜单列表数据（一次性返回全量树）
 */
async function fetchData(): Promise<void> {
  loading.value = true;
  try {
    list.value = await MenuAPI.getList(queryParams);
    // 表格渲染出树节点后再应用展开状态
    await nextTick();
    applyExpansion();
  } finally {
    loading.value = false;
  }
}

/**
 * 按当前筛选条件重新查询
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
 * 展开/折叠全部菜单层级
 */
function toggleExpandAll(): void {
  expandAll.value = !expandAll.value;
  applyExpansion();
}

/**
 * 按当前开关应用展开状态，逐级下发到所有菜单节点
 */
function applyExpansion(): void {
  /**
   * 递归展开树节点
   */
  const walk = (rows: MenuItem[]): void => {
    rows.forEach((row) => {
      if (!row.children?.length) return;

      tableRef.value?.toggleRowExpansion(row, expandAll.value);
      walk(row.children);
    });
  };

  walk(list.value);
}

/**
 * 菜单行的图标类名
 * 未配图标时兜底为默认菜单图标（侧边栏同样兜底）；按钮不进侧边栏，不兜底
 *
 * @param row 当前菜单行
 */
function getMenuIconClass(row: MenuItem): string {
  if (row.type === MenuTypeEnum.BUTTON) return "";
  return `i-svg:${row.icon || "menu"}`;
}

/**
 * 菜单的完整访问地址
 *
 * @param row 当前菜单行
 */
function getMenuAccessPath(row: MenuItem): string {
  if (row.type === MenuTypeEnum.EXTERNAL) return row.externalUrl ?? "";
  if (row.type === MenuTypeEnum.BUTTON) return "";
  return findMenuTrail(list.value, row.id).reduce(
    (path, menu) => joinRoutePath(path, menu.routePath),
    ""
  );
}

/**
 * 菜单关联的页面路径
 *
 * @param row 当前菜单行
 */
function getMenuComponentPath(row: MenuItem): string {
  if (row.type !== MenuTypeEnum.MENU) return "";
  return row.component ?? "";
}

/**
 * 从菜单树中查找菜单及其祖先链
 *
 * @param menus 菜单树
 * @param id 目标菜单 ID
 * @param trail 已遍历的祖先
 */
function findMenuTrail(menus: MenuItem[], id?: string, trail: MenuItem[] = []): MenuItem[] {
  if (!id) return [];

  for (const menu of menus) {
    const next = [...trail, menu];
    if (menu.id === id) return next;

    const hit = findMenuTrail(menu.children ?? [], id, next);
    if (hit.length) return hit;
  }

  return [];
}

/**
 * 从菜单树中查找菜单
 *
 * @param menus 菜单树
 * @param id 目标菜单 ID
 */
function findMenuById(menus: MenuItem[], id?: string): MenuItem | undefined {
  return findMenuTrail(menus, id).pop();
}

/**
 * 菜单树转为下拉选项树
 *
 * @param menus 菜单树
 */
function toMenuOptions(menus: MenuItem[]): OptionItem[] {
  return menus.map((menu) => ({
    value: menu.id ?? "",
    label: menu.name ?? "",
    children: toMenuOptions(menu.children ?? []),
  }));
}

/**
 * 同级菜单的下一个排序值，让新增的菜单排在末尾
 *
 * @param menus 菜单树
 * @param parentId 上级菜单 ID
 */
function resolveNextSort(menus: MenuItem[], parentId: string): number {
  const siblings = parentId === "0" ? menus : (findMenuById(menus, parentId)?.children ?? []);
  return siblings.reduce((max, item) => Math.max(max, item.sort ?? 0), 0) + 1;
}

/**
 * 同级页面已有按钮的权限模块名，取出现次数最多的那一段
 *
 * @param menus 菜单树
 * @param parentId 上级菜单 ID
 */
function resolveSiblingPermModule(menus: MenuItem[], parentId: string): string {
  const siblings = parentId === "0" ? menus : (findMenuById(menus, parentId)?.children ?? []);
  const counter = new Map<string, number>();

  siblings.forEach((sibling) =>
    (sibling.children ?? []).forEach((child) => {
      if (child.type !== MenuTypeEnum.BUTTON) return;
      const module = child.perm?.split(":")[0];
      if (module) counter.set(module, (counter.get(module) ?? 0) + 1);
    })
  );

  let module = "";
  let max = 0;
  counter.forEach((count, name) => {
    if (count > max) {
      max = count;
      module = name;
    }
  });
  return module;
}

/**
 * 按钮权限前缀，由同级模块名与当前访问路径拼成
 */
function deriveButtonPermPrefix(): string {
  return [siblingPermModule.value, formData.routePath?.trim()].filter(Boolean).join(":");
}

/**
 * 访问路径只保留最后一段
 * 该字段只存当前这一级的路径片段，上级路径由系统拼接；AI 偶尔会返回带上级的完整地址
 *
 * @param routePath AI 返回的访问路径
 */
function resolveAiRoutePath(routePath: string): string {
  return routePath.trim().split("/").filter(Boolean).pop() ?? "";
}

/**
 * 判断菜单是否位于指定子树内（含自身）
 *
 * @param root 子树根节点
 * @param targetId 目标菜单 ID
 */
function isMenuInSubtree(root: MenuItem | undefined, targetId?: string): boolean {
  if (!root || !targetId) return false;
  if (root.id === targetId) return true;
  return (root.children ?? []).some((child) => isMenuInSubtree(child, targetId));
}

/**
 * 按访问地址生成路由名称
 *
 * @param path 完整访问地址，如 /system/user
 */
function deriveRouteName(path: string): string {
  return path
    .split(/[/\-_]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join("");
}

/**
 * 判断状态是否为启用
 */
function isStatusEnabled(value?: number | boolean): boolean {
  return value === CommonStatus.ENABLED || value === true;
}

/**
 * 替换表单数据，避免上一次编辑残留字段
 *
 * @param data 菜单表单数据
 */
function assignFormData(data: MenuForm): void {
  Object.keys(formData).forEach((key) => {
    delete (formData as Record<string, unknown>)[key];
  });
  Object.assign(formData, { ...initialFormData, ...data, params: data.params ?? [] });

  // 历史数据或手动输入可能带 .vue 后缀、开头斜杠，统一规整后再回填
  if (formData.component) formData.component = normalizeViewPath(formData.component);

  componentManual.value = Boolean(formData.component) && !isViewComponent(formData.component);
  externalMode.value = formData.component === "iframe" ? "iframe" : "blank";
  originalComponent.value = formData.component;
  advancedPanels.value = [ADVANCED_PANEL];
  clearAiFill();
  permPrefixAuto.value = false;
}

/**
 * 重置表单数据和验证状态
 */
function resetForm(): void {
  menuFormRef.value?.resetFields();
  menuFormRef.value?.clearValidate();
  assignFormData({ ...initialFormData });
}

/**
 * 打开新增/编辑抽屉
 *
 * @param parentId 新增子菜单时的父菜单 ID
 * @param menuId 编辑时的菜单 ID
 */
async function openDialog(parentId?: string, menuId?: string): Promise<void> {
  // 拉全量菜单：上级选项与排序推算都要用完整数据，避免被搜索条件过滤
  const [allMenus, menuForm] = await Promise.all([
    MenuAPI.getList({}),
    menuId ? MenuAPI.getFormData(menuId) : Promise.resolve(null),
  ]);
  parentMenuTree.value = allMenus;

  dialogState.visible = true;
  if (menuForm) {
    dialogState.title = "编辑菜单";
    assignFormData(menuForm);
    return;
  }

  dialogState.title = "新增菜单";
  const nextParentId = parentId?.toString() ?? "0";
  const parent = findMenuById(allMenus, nextParentId);
  assignFormData({
    ...initialFormData,
    parentId: nextParentId,
    sort: resolveNextSort(allMenus, nextParentId),
    // 页面下只能新增按钮权限
    type: parent?.type === MenuTypeEnum.MENU ? MenuTypeEnum.BUTTON : MenuTypeEnum.MENU,
  });
  siblingPermModule.value = resolveSiblingPermModule(allMenus, nextParentId);
}

/**
 * 菜单类型切换：清空类型专属字段并补默认值
 */
function handleTypeChange(): void {
  const type = formData.type as MenuTypeEnum;

  Object.assign(formData, {
    routeName: undefined,
    routePath: undefined,
    component: undefined,
    externalUrl: undefined,
    redirect: undefined,
    perm: undefined,
    params: [],
    keepAlive: type === MenuTypeEnum.MENU ? 1 : undefined,
    generateCrudButtons: false,
    buttonPermPrefix: undefined,
  });

  if (type === MenuTypeEnum.EXTERNAL) {
    externalMode.value = "blank";
    formData.component = "";
  }

  // 类型切换会清空权限标识等字段，AI 推断结果一并失效
  clearAiFill();
  permPrefixAuto.value = false;

  nextTick(() => menuFormRef.value?.clearValidate());
}

/**
 * AI 推断访问路径与权限标识
 */
async function handleAiFill(): Promise<void> {
  const name = formData.name?.trim();
  if (!name) return;

  aiLoading.value = true;
  // 记录推断前的值，供撤销恢复
  aiSnapshot = { routePath: formData.routePath, perm: formData.perm, icon: formData.icon };
  try {
    const result = await MenuAPI.aiFill({
      name,
      type: formData.type,
      parentId: formData.parentId,
    });

    // 只回填当前类型实际使用的字段：按钮只认权限标识，目录与页面补访问路径与图标
    const filled: string[] = [];
    const aiRoutePath = result.routePath ? resolveAiRoutePath(result.routePath) : "";
    if (aiRoutePath && !isButton.value) {
      formData.routePath = aiRoutePath;
      filled.push(`访问路径 ${aiRoutePath}`);

      // 路由名称按访问地址派生，与访问路径保持同源；用户已手填时不覆盖
      if (isPage.value && !formData.routeName?.trim() && derivedRouteName.value) {
        formData.routeName = derivedRouteName.value;
        filled.push(`路由名称 ${derivedRouteName.value}`);
      }
    }
    if (result.perm && isButton.value) {
      formData.perm = result.perm;
      filled.push(`权限标识 ${result.perm}`);
    }
    // 图标由关键词匹配前端图标库，匹配不到就不填
    if (!isButton.value) {
      const icon = matchIcon(result.iconKeywords ?? []);
      if (icon) {
        formData.icon = icon;
        filled.push(`图标 ${icon}`);
      }
    }
    if (filled.length === 0) {
      clearAiFill();
      ElMessage.warning("AI 未推断出可用结果");
      return;
    }

    aiFilledTip.value = `已推断 ${filled.join("、")}`;
    nextTick(() => menuFormRef.value?.clearValidate(["routePath", "perm"]));
  } catch {
    // 业务异常已由请求拦截器统一提示后端 message（含 AI 未开启的具体原因）
    clearAiFill();
  } finally {
    aiLoading.value = false;
  }
}

/**
 * 恢复到 AI 推断前的值
 */
function handleAiUndo(): void {
  if (!aiSnapshot) return;

  formData.routePath = aiSnapshot.routePath;
  formData.perm = aiSnapshot.perm;
  formData.icon = aiSnapshot.icon;
  clearAiFill();
  nextTick(() => menuFormRef.value?.clearValidate(["routePath", "perm"]));
  ElMessage.info("已撤销 AI 推断");
}

/**
 * 清空 AI 推断结果与快照
 */
function clearAiFill(): void {
  aiSnapshot = null;
  aiFilledTip.value = "";
}

/**
 * 外链打开方式切换：内嵌外链需要路由承载
 */
function handleExternalModeChange(): void {
  formData.component = externalMode.value === "iframe" ? "iframe" : "";
  if (externalMode.value === "iframe") {
    formData.keepAlive ??= 1;
  }
  nextTick(() => menuFormRef.value?.clearValidate(["routePath", "component"]));
}

/**
 * 切换页面路径的录入方式
 */
function toggleComponentManual(): void {
  componentManual.value = !componentManual.value;
  nextTick(() => menuFormRef.value?.clearValidate("component"));
}

/**
 * 手动输入的页面路径失焦后统一格式：去掉开头的斜杠与 .vue 后缀
 */
function handleComponentBlur(): void {
  if (!formData.component) return;
  formData.component = normalizeViewPath(formData.component);
  nextTick(() => menuFormRef.value?.clearValidate("component"));
}

/**
 * 切换缓存状态后刷新路由名称校验
 */
function handleKeepAliveChange(): void {
  menuFormRef.value?.clearValidate("routeName");
}

/**
 * 按菜单类型清理无关字段
 */
function normalizeMenuPayload(): MenuForm {
  const payload: MenuForm = {
    ...formData,
    name: formData.name?.trim(),
    routeName: formData.routeName?.trim() || undefined,
    routePath: formData.routePath?.trim() || undefined,
    component: formData.component ? normalizeViewPath(formData.component) : undefined,
    externalUrl: formData.externalUrl?.trim() || undefined,
    redirect: formData.redirect?.trim() || undefined,
    params: formData.params?.filter((item) => item.key && item.value) ?? [],
    // 后端按 前缀:动作 拼接，去掉末尾冒号避免出现 sys:user::list
    buttonPermPrefix: formData.buttonPermPrefix?.trim().replace(/:+$/, "") || undefined,
  };

  if (isCatalog.value) {
    payload.routeName = undefined;
    payload.component = undefined;
    payload.externalUrl = undefined;
    payload.perm = undefined;
    payload.keepAlive = undefined;
    payload.params = [];
  }

  if (isPage.value) {
    payload.externalUrl = undefined;
    payload.redirect = undefined;
    payload.perm = undefined;
  }

  if (isExternal.value) {
    payload.perm = undefined;
    payload.redirect = undefined;
    payload.params = [];

    if (!isEmbeddedExternal.value) {
      // 新标签页：不需要路由名称、路径、缓存
      payload.routeName = undefined;
      payload.routePath = undefined;
      payload.component = undefined;
      payload.keepAlive = undefined;
    }
  }

  if (isButton.value) {
    payload.routeName = undefined;
    payload.routePath = undefined;
    payload.component = undefined;
    payload.externalUrl = undefined;
    payload.redirect = undefined;
    payload.icon = undefined;
    payload.keepAlive = undefined;
    payload.params = [];
  }

  // 按钮权限仅页面类型可选，其他类型不带
  if (!isPage.value) {
    payload.generateCrudButtons = undefined;
    payload.buttonPermPrefix = undefined;
  }

  // 路由名称用于程序内部定位页面，留空时按访问地址生成；关闭缓存时不下发
  if (payload.keepAlive && isStatusEnabled(payload.keepAlive)) {
    payload.routeName = payload.routeName || derivedRouteName.value;
  } else {
    payload.routeName = undefined;
  }

  return payload;
}

/**
 * 校验并提交菜单表单
 */
async function handleSubmit(): Promise<void> {
  const valid = await menuFormRef.value?.validate().then(
    () => true,
    () => false
  );
  if (!valid) return;

  const menuId = formData.id;
  const selfMenu = findMenuById(parentMenuTree.value, menuId);
  if (isMenuInSubtree(selfMenu, formData.parentId)) {
    ElMessage.error("上级菜单不能是自身或其下级");
    return;
  }

  const payload = normalizeMenuPayload();
  loading.value = true;
  try {
    if (menuId) {
      await MenuAPI.update(menuId, payload);
      ElMessage.success("修改成功");
    } else {
      await MenuAPI.create(payload);
      ElMessage.success("新增成功");
    }
    closeDialog();
    fetchData();
    refreshUserRoutes();
  } finally {
    loading.value = false;
  }
}

/**
 * 删除菜单
 *
 * @param menuId 菜单 ID
 */
async function handleDelete(menuId: string): Promise<void> {
  const menu = findMenuById(list.value, menuId);
  if (!menu) return;

  const childCount = countMenus(menu.children ?? []);
  const childTip = childCount ? `，其下 ${childCount} 个子菜单会一并删除` : "";

  try {
    await ElMessageBox.confirm(`确认删除「${menu.name}」${childTip}？`, "删除确认", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
  } catch {
    return;
  }

  loading.value = true;
  try {
    await MenuAPI.deleteById(menuId);
    ElMessage.success("删除成功");
    fetchData();
    refreshUserRoutes();
  } finally {
    loading.value = false;
  }
}

/**
 * 统计菜单及其子孙数量
 *
 * @param menus 子菜单列表
 */
function countMenus(menus: MenuItem[]): number {
  return menus.reduce((total, menu) => total + 1 + countMenus(menu.children ?? []), 0);
}

/**
 * 菜单变更后重建动态路由，让侧边栏与页面立即生效
 */
async function refreshUserRoutes(): Promise<void> {
  try {
    await usePermissionStore().reloadRoutes();
  } catch {
    // 重建失败不阻塞当前操作，刷新页面后会重新拉取
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

<style scoped>
/* 访问地址列：单行省略；外链可点击打开，值可一键复制 */
.menu-address-cell {
  display: flex;
  gap: 4px;
  align-items: center;
  min-width: 0;
}

.menu-address-cell__link,
.menu-address-cell__text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-address-cell__link {
  color: var(--el-color-primary);
  text-decoration: none;
}

.menu-address-cell__link:hover {
  text-decoration: underline;
}

/* 单行文本列：过长省略，完整内容用 title 悬停查看 */
.menu-cell-ellipsis {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 菜单名称列：树形箭头与名称同行并垂直居中，名称过长省略 */
:deep(.menu-name-column .cell) {
  display: flex;
  align-items: center;
}

.menu-name-cell {
  display: flex;
  gap: 6px;
  align-items: center;
  min-width: 0;
}

/* 固定宽度占位：没配图标的菜单，名称也与其它行左对齐 */
.menu-name-cell__icon {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 16px;
}

/* 兜底图标比真实图标浅，便于一眼区分哪些菜单还没配图标 */
.menu-name-cell__icon.is-default {
  opacity: 0.45;
}

.menu-name-cell__text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 目录是最外层的结构节点，加粗以突出层级 */
.menu-name-cell__text.is-catalog {
  font-weight: 600;
}

.menu-form {
  padding-right: 4px;
}

/* 字段带说明文字，压缩默认间距避免抽屉出现滚动条 */
.menu-form :deep(.el-form-item) {
  margin-bottom: 14px;
}

.menu-form :deep(.el-form-item__label) {
  white-space: nowrap;
}

.menu-form__label {
  display: inline-flex;
  gap: 4px;
  align-items: center;
}

/* 字段与提示：控件独占一行，提示跟在下方 */
.menu-form__field {
  width: 100%;
}

/* 控件与操作并排：控件撑满剩余宽度 */
.menu-form__row {
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;

  > :first-child {
    flex: 1;
    min-width: 0;
  }
}

.menu-form__switch {
  flex: none;
}

/* 按钮权限前缀输入框：与上方勾选框留出间距 */
.menu-form__prefix {
  margin-top: 8px;
}

/* AI 推断按钮的包裹层：按钮置灰时不触发 hover，提示挂在外层才能显示 */
.menu-form__tip-trigger {
  display: inline-flex;
  flex: none;
}

.menu-form__tip {
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.4;
  color: var(--el-text-color-secondary);
}

/* AI 结果行里的撤销按钮：贴着小字提示，去掉默认内边距 */
.menu-form__undo {
  padding: 0;
  margin-left: 4px;
  font-size: 12px;
  vertical-align: baseline;
}

.menu-form__path {
  color: var(--el-color-primary);
}

/* 落位预览：说明当前配置在侧边栏的效果 */
.menu-preview {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 10px 12px;
  margin-bottom: 20px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--el-text-color-regular);
  background: var(--el-color-primary-light-9);
  border-radius: 8px;
}

.menu-preview__icon {
  flex: none;
  font-size: 14px;
  color: var(--el-color-primary);
}

.menu-form__advanced {
  margin-top: 4px;
  border-top: none;
}

.menu-type-item {
  margin-bottom: 12px;
}

.menu-type-control {
  width: 100%;
}

.menu-type-option {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  justify-content: center;
}

.menu-type-option__icon {
  font-size: 14px;
}

.menu-param-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.menu-param-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr) 18px 18px;
  gap: 8px;
  align-items: center;
  width: 100%;
}

.menu-param-row__equal {
  color: var(--el-text-color-secondary);
}

.menu-param-row__action {
  cursor: pointer;
}
</style>
