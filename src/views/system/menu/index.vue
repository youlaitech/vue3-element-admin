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
          <el-button v-hasPerm="['sys:menu:create']" type="primary" @click="openDialog('0')">
            新增
          </el-button>
        </div>
        <div class="page-toolbar__right">
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
          ref="dataTableRef"
          v-loading="loading"
          class="page-table"
          border
          row-key="id"
          :data="list"
          height="100%"
          :tree-props="{
            children: 'children',
            hasChildren: 'hasChildren',
          }"
          @row-click="handleRowClick"
        >
          <el-table-column label="菜单名称" min-width="200">
            <template #default="scope">
              <div class="menu-name-cell">
                <span class="menu-name-cell__icon">
                  <template v-if="scope.row.icon && scope.row.icon.startsWith('el-icon')">
                    <el-icon style="vertical-align: -0.15em">
                      <component :is="scope.row.icon.replace('el-icon-', '')" />
                    </el-icon>
                  </template>
                  <template v-else-if="scope.row.icon">
                    <span :class="`i-svg:${scope.row.icon}`" />
                  </template>
                </span>
                <span class="menu-name-cell__text">{{ scope.row.name }}</span>
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
          <el-table-column label="访问路径" align="left" min-width="180">
            <template #default="scope">
              {{ getMenuAccessPath(scope.row) }}
            </template>
          </el-table-column>
          <el-table-column label="页面组件" align="left" min-width="180">
            <template #default="scope">
              {{ getMenuComponentPath(scope.row) }}
            </template>
          </el-table-column>
          <el-table-column label="权限标识" align="center" width="200" prop="perm" />
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
                新增
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
      @close="closeDialog"
    >
      <el-form
        ref="menuFormRef"
        class="menu-form"
        :model="formData"
        :rules="rules"
        label-width="140px"
      >
        <el-form-item label="父级菜单" prop="parentId">
          <el-tree-select
            v-model="formData.parentId"
            placeholder="选择上级菜单"
            :data="menuOptions"
            filterable
            check-strictly
            :render-after-expand="false"
          />
        </el-form-item>

        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入菜单名称" />
        </el-form-item>

        <el-form-item label="菜单类型" prop="type">
          <div class="menu-type-field">
            <el-radio-group
              v-model="formData.type"
              class="menu-type-group"
              @change="handleMenuTypeChange"
            >
              <el-radio-button :value="MenuTypeEnum.CATALOG">目录</el-radio-button>
              <el-radio-button :value="MenuTypeEnum.MENU">菜单</el-radio-button>
              <el-radio-button :value="MenuTypeEnum.EXTERNAL">外链</el-radio-button>
              <el-radio-button :value="MenuTypeEnum.BUTTON">按钮</el-radio-button>
            </el-radio-group>
            <div class="menu-type-hint">{{ menuTypeHint }}</div>
          </div>
        </el-form-item>

        <template v-if="showPageConfig">
          <el-form-item prop="routePath">
            <template #label>
              <div class="flex-y-center">
                访问路径
                <el-tooltip
                  content="填写当前菜单这一段路径，例如 user；完整路径会自动跟随父级菜单"
                  placement="bottom"
                >
                  <el-icon class="ml-1 cursor-pointer">
                    <QuestionFilled />
                  </el-icon>
                </el-tooltip>
              </div>
            </template>
            <el-input v-model="formData.routePath" placeholder="user" />
          </el-form-item>

          <el-form-item prop="component">
            <template #label>
              <div class="flex-y-center">
                页面组件
                <el-tooltip
                  content="填写 src/views 下的页面路径，省略 .vue 后缀"
                  placement="bottom"
                >
                  <el-icon class="ml-1 cursor-pointer">
                    <QuestionFilled />
                  </el-icon>
                </el-tooltip>
              </div>
            </template>

            <el-input v-model="formData.component" placeholder="system/user/index">
              <template #prepend>src/views/</template>
              <template #append>.vue</template>
            </el-input>
          </el-form-item>
        </template>

        <template v-if="showCatalogConfig">
          <el-form-item prop="routePath">
            <template #label>
              <div class="flex-y-center">
                访问路径
                <el-tooltip
                  content="顶级目录填写完整路径，例如 /system；子级目录只填当前这一段，例如 report"
                  placement="bottom"
                >
                  <el-icon class="ml-1 cursor-pointer">
                    <QuestionFilled />
                  </el-icon>
                </el-tooltip>
              </div>
            </template>
            <el-input v-model="formData.routePath" placeholder="/system" />
          </el-form-item>

          <el-form-item>
            <template #label>
              <div class="flex-y-center">
                默认跳转
                <el-tooltip
                  content="访问当前目录路径时，自动跳转到指定页面。通常填写该目录下的默认菜单完整路径，例如 /system/user。"
                  placement="bottom"
                >
                  <el-icon class="ml-1 cursor-pointer">
                    <QuestionFilled />
                  </el-icon>
                </el-tooltip>
              </div>
            </template>
            <el-input v-model="formData.redirect" placeholder="/system/user" />
          </el-form-item>
        </template>

        <template v-if="showExternalConfig">
          <el-form-item label="外链地址" prop="externalUrl">
            <el-input v-model="formData.externalUrl" placeholder="https://example.com" clearable />
          </el-form-item>

          <el-form-item label="打开方式" prop="component">
            <el-radio-group v-model="formData.component" @change="handleComponentChange">
              <el-radio value="">新标签页</el-radio>
              <el-radio value="iframe">系统内嵌</el-radio>
            </el-radio-group>
          </el-form-item>

          <template v-if="isEmbeddedExternal">
            <el-form-item prop="routePath">
              <template #label>
                <div class="flex-y-center">
                  系统路径
                  <el-tooltip content="内嵌外链在系统中的访问路径，例如 apifox" placement="bottom">
                    <el-icon class="ml-1 cursor-pointer">
                      <QuestionFilled />
                    </el-icon>
                  </el-tooltip>
                </div>
              </template>
              <el-input v-model="formData.routePath" placeholder="apifox" />
            </el-form-item>
          </template>
        </template>

        <template v-if="showPermissionConfig">
          <el-form-item label="权限标识" prop="perm">
            <el-input v-model="formData.perm" placeholder="sys:user:create" />
          </el-form-item>
        </template>

        <el-form-item v-if="formData.type !== MenuTypeEnum.BUTTON" prop="visible" label="显示状态">
          <el-radio-group v-model="formData.visible">
            <el-radio :value="CommonStatus.ENABLED">显示</el-radio>
            <el-radio :value="CommonStatus.DISABLED">隐藏</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="showCatalogDisplay">
          <template #label>
            <div class="flex-y-center">
              单子级显示
              <el-tooltip
                content="仅在当前项只有 1 个可见子级时生效。选择“始终显示本级”后，会保留当前项再显示子级。"
                placement="bottom"
              >
                <el-icon class="ml-1 cursor-pointer">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </div>
          </template>

          <el-radio-group v-model="formData.alwaysShow">
            <el-radio :value="0">显示子级</el-radio>
            <el-radio :value="1">始终显示本级</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="showPageCache" label="页面缓存">
          <el-radio-group v-model="formData.keepAlive" @change="handleKeepAliveChange">
            <el-radio :value="1">开启</el-radio>
            <el-radio :value="0">关闭</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="showRouteName" prop="routeName">
          <template #label>
            <div class="flex-y-center">
              页面标识
              <el-tooltip :content="routeNameTooltip" placement="bottom">
                <el-icon class="ml-1 cursor-pointer">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
          <el-input v-model="formData.routeName" :placeholder="routeNamePlaceholder" />
        </el-form-item>

        <el-form-item v-if="showRouteParams">
          <template #label>
            <div class="flex-y-center">
              路由参数
              <el-tooltip placement="bottom" effect="light">
                <template #content>页面内可通过 useRoute().query 读取</template>
                <el-icon class="ml-1 cursor-pointer">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </div>
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

        <el-form-item
          v-if="formData.type !== MenuTypeEnum.BUTTON && showMenuScope"
          prop="scope"
          label="菜单范围"
        >
          <el-radio-group v-model="formData.scope">
            <el-radio :value="MenuScopeEnum.PLATFORM">平台菜单</el-radio>
            <el-radio :value="MenuScopeEnum.TENANT">业务菜单</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="formData.type !== MenuTypeEnum.BUTTON" label="图标" prop="icon">
          <icon-select v-model="formData.icon" />
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input-number
            v-model="formData.sort"
            style="width: 120px"
            controls-position="right"
            :min="0"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">确定</el-button>
          <el-button @click="closeDialog">取消</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { useFullscreen } from "@vueuse/core";
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus";
import {
  CirclePlusFilled,
  DeleteFilled,
  FullScreen,
  QuestionFilled,
  Refresh,
} from "@element-plus/icons-vue";

import MenuAPI from "@/api/system/menu";
import type { MenuForm, MenuItem, MenuQueryParams } from "@/api/system/menu";
import type { OptionItem } from "@/api/common";
import { useAppStore } from "@/stores/app";
import { CommonStatus, MenuScopeEnum, MenuTypeEnum } from "@/enums";
import { DeviceEnum } from "@/enums/settings";
import { isTenantEnabled } from "@/utils/tenant";
import { isValidURL } from "@/utils";

defineOptions({
  name: "SysMenu",
  inheritAttrs: false,
});

const appStore = useAppStore();

const tableWrapperRef = ref<HTMLElement | null>(null);
const { toggle: toggleFullscreen } = useFullscreen(tableWrapperRef);

const queryFormRef = ref<FormInstance>();
const menuFormRef = ref<FormInstance>();

const loading = ref(false);
const list = ref<MenuItem[]>([]);
const queryParams = reactive<MenuQueryParams>({ keywords: "" });

const dialogState = reactive({
  title: "新增菜单",
  visible: false,
});

const menuOptions = ref<OptionItem[]>([]);

const initialFormData: MenuForm = {
  id: undefined,
  parentId: "0",
  visible: CommonStatus.ENABLED,
  scope: MenuScopeEnum.TENANT,
  sort: 1,
  type: MenuTypeEnum.MENU,
  alwaysShow: 0,
  keepAlive: 1,
  params: [],
};

const menuTypes = [
  MenuTypeEnum.CATALOG,
  MenuTypeEnum.MENU,
  MenuTypeEnum.EXTERNAL,
  MenuTypeEnum.BUTTON,
];

const formData = reactive<MenuForm>({ ...initialFormData });
const currentMenuType = ref<MenuTypeEnum>(MenuTypeEnum.MENU);
const menuTypeDrafts = reactive<Record<MenuTypeEnum, Partial<MenuForm>>>(createMenuTypeDrafts());

// 多租户关闭时隐藏菜单范围字段。
const showMenuScope = computed(() => isTenantEnabled());

// 抽屉宽度（响应式）。
const drawerSize = computed(() => (appStore.device === DeviceEnum.DESKTOP ? "600px" : "90%"));

// 系统内嵌外链需要一个内部路由承载 iframe 页面。
const isEmbeddedExternal = computed(
  () => formData.type === MenuTypeEnum.EXTERNAL && formData.component === "iframe"
);

const showCatalogConfig = computed(() => formData.type === MenuTypeEnum.CATALOG);

const showPageConfig = computed(() => formData.type === MenuTypeEnum.MENU);

const showExternalConfig = computed(() => formData.type === MenuTypeEnum.EXTERNAL);

const showPermissionConfig = computed(() => formData.type === MenuTypeEnum.BUTTON);

const showRoutePath = computed(
  () =>
    formData.type === MenuTypeEnum.CATALOG ||
    formData.type === MenuTypeEnum.MENU ||
    isEmbeddedExternal.value
);

const showCatalogDisplay = computed(() => formData.type === MenuTypeEnum.CATALOG);

const showPageCache = computed(
  () => formData.type === MenuTypeEnum.MENU || isEmbeddedExternal.value
);

const showRouteName = computed(() => showPageCache.value && isStatusEnabled(formData.keepAlive));

const showRouteParams = computed(() => formData.type === MenuTypeEnum.MENU);

const routeNameTooltip = computed(() =>
  isEmbeddedExternal.value
    ? "开启缓存时填写，需和内嵌页路由名称保持一致，例如 Apifox"
    : "开启缓存时填写，需和页面组件 name 保持一致，例如 User"
);

const routeNamePlaceholder = computed(() => (isEmbeddedExternal.value ? "Apifox" : "User"));

const menuTypeHint = computed(() => {
  if (formData.type === MenuTypeEnum.CATALOG) {
    return "用于菜单分组，不直接对应页面";
  }

  if (formData.type === MenuTypeEnum.MENU) {
    return "最常用，关联系统内部页面";
  }

  if (formData.type === MenuTypeEnum.EXTERNAL) {
    return "打开第三方地址，可新开页或系统内嵌";
  }

  if (formData.type === MenuTypeEnum.BUTTON) {
    return "用于控制页面按钮或操作权限";
  }

  return "";
});

const validateRouteName = (_: unknown, value: string, callback: (error?: Error) => void) => {
  if (showRouteName.value && !value) {
    callback(new Error("请输入页面标识"));
    return;
  }
  callback();
};

function isStatusEnabled(value?: number | boolean): boolean {
  return value === CommonStatus.ENABLED || value === true;
}

function createMenuTypeDrafts(): Record<MenuTypeEnum, Partial<MenuForm>> {
  return {
    [MenuTypeEnum.CATALOG]: {
      routePath: "",
      redirect: "",
      icon: "",
      alwaysShow: 0,
    },
    [MenuTypeEnum.MENU]: {
      routeName: "",
      routePath: "",
      component: "",
      icon: "",
      keepAlive: 1,
      params: [],
    },
    [MenuTypeEnum.EXTERNAL]: {
      externalUrl: "",
      icon: "",
      component: "",
      routeName: "",
      routePath: "",
      keepAlive: 1,
    },
    [MenuTypeEnum.BUTTON]: {
      perm: "",
    },
  };
}

function getMenuType(type?: MenuForm["type"]): MenuTypeEnum {
  return menuTypes.includes(type as MenuTypeEnum) ? (type as MenuTypeEnum) : MenuTypeEnum.MENU;
}

const validateRoutePath = (_: unknown, value: string, callback: (error?: Error) => void) => {
  if (showRoutePath.value && !value) {
    callback(new Error(isEmbeddedExternal.value ? "请输入系统路径" : "请输入访问路径"));
    return;
  }
  callback();
};

const validateComponent = (_: unknown, value: string, callback: (error?: Error) => void) => {
  if (formData.type === MenuTypeEnum.MENU && !value) {
    callback(new Error("请输入页面组件"));
    return;
  }
  callback();
};

const validateExternalUrl = (_: unknown, value: string, callback: (error?: Error) => void) => {
  if (formData.type !== MenuTypeEnum.EXTERNAL) {
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

const validatePerm = (_: unknown, value: string, callback: (error?: Error) => void) => {
  if (formData.type === MenuTypeEnum.BUTTON && !value) {
    callback(new Error("请输入权限标识"));
    return;
  }
  callback();
};

const rules: FormRules<MenuForm> = {
  parentId: [{ required: true, message: "请选择父级菜单", trigger: "blur" }],
  name: [{ required: true, message: "请输入菜单名称", trigger: "blur" }],
  type: [{ required: true, message: "请选择菜单类型", trigger: "blur" }],
  routeName: [
    { required: true, message: "请输入页面标识", validator: validateRouteName, trigger: "blur" },
  ],
  routePath: [
    { required: true, message: "请输入访问路径", validator: validateRoutePath, trigger: "blur" },
  ],
  component: [
    { required: true, message: "请输入页面组件", validator: validateComponent, trigger: "blur" },
  ],
  externalUrl: [
    { required: true, message: "请输入外链地址", validator: validateExternalUrl, trigger: "blur" },
  ],
  perm: [{ required: true, message: "请输入权限标识", validator: validatePerm, trigger: "blur" }],

  visible: [{ required: true, message: "请选择显示状态", trigger: "change" }],
  scope: [{ required: true, message: "请选择菜单范围", trigger: "change" }],
};

/**
 * 拉取菜单列表数据（一次性返回全量树）。
 */
async function fetchData(): Promise<void> {
  loading.value = true;
  try {
    list.value = await MenuAPI.getList(queryParams);
  } finally {
    loading.value = false;
  }
}

/**
 * 按当前筛选条件重新查询。
 */
function handleQuery(): void {
  fetchData();
}

/**
 * 重置搜索表单后重新查询。
 */
function handleResetQuery(): void {
  queryFormRef.value?.resetFields();
  fetchData();
}

/**
 * 表格行点击事件
 *
 * @param row 当前菜单行
 */
function handleRowClick(row: MenuItem): void {
  void row;
}

/**
 * 获取菜单列表中的路径
 */
function getMenuAccessPath(row: MenuItem): string {
  if (row.type === MenuTypeEnum.EXTERNAL) {
    return row.externalUrl ?? "";
  }
  return row.routePath ?? "";
}

/**
 * 获取菜单列表中的组件路径
 */
function getMenuComponentPath(row: MenuItem): string {
  if (row.type !== MenuTypeEnum.MENU) return "";
  return row.component ?? "";
}

/**
 * 根据父级菜单推断新增类型
 */
function getDefaultMenuType(parentId?: string): MenuForm["type"] {
  if (!parentId || parentId === "0") return MenuTypeEnum.CATALOG;

  const parent = findMenuById(list.value, parentId);
  if (parent?.type === MenuTypeEnum.MENU) return MenuTypeEnum.BUTTON;

  return MenuTypeEnum.MENU;
}

/**
 * 从菜单树中查找指定菜单
 */
function findMenuById(menus: MenuItem[], id: string): MenuItem | undefined {
  for (const menu of menus) {
    if (menu.id === id) return menu;

    const child = findMenuById(menu.children ?? [], id);
    if (child) return child;
  }
}

/**
 * 按菜单类型清理无关字段
 */
function normalizeMenuPayload(): MenuForm {
  const payload: MenuForm = {
    ...formData,
    params: formData.params?.filter((item) => item.key && item.value) ?? [],
  };

  if (payload.type === MenuTypeEnum.CATALOG) {
    payload.routeName = undefined;
    payload.component = undefined;
    payload.externalUrl = undefined;
    payload.perm = undefined;
    payload.keepAlive = undefined;
    payload.params = [];
  }

  if (payload.type === MenuTypeEnum.MENU) {
    payload.externalUrl = undefined;
    payload.redirect = undefined;
    payload.perm = undefined;
    payload.alwaysShow = undefined;

    if (!isStatusEnabled(payload.keepAlive)) {
      payload.routeName = undefined;
    }
  }

  if (payload.type === MenuTypeEnum.EXTERNAL) {
    payload.component = undefined;
    payload.perm = undefined;
    payload.redirect = undefined;
    payload.alwaysShow = undefined;
    payload.params = [];

    if (!payload.component) {
      payload.routeName = undefined;
      payload.routePath = undefined;
      payload.keepAlive = undefined;
    } else if (!isStatusEnabled(payload.keepAlive)) {
      payload.routeName = undefined;
    }
  }

  if (payload.type === MenuTypeEnum.BUTTON) {
    payload.routeName = undefined;
    payload.routePath = undefined;
    payload.component = undefined;
    payload.externalUrl = undefined;
    payload.redirect = undefined;
    payload.icon = undefined;
    payload.keepAlive = undefined;
    payload.alwaysShow = undefined;
    payload.params = [];
  }

  return payload;
}

function resetMenuTypeDrafts(): void {
  Object.assign(menuTypeDrafts, createMenuTypeDrafts());
}

function saveMenuTypeDraft(type: MenuTypeEnum): void {
  menuTypeDrafts[type] = {
    routeName: formData.routeName,
    routePath: formData.routePath,
    component: formData.component,
    externalUrl: formData.externalUrl,
    icon: formData.icon,
    redirect: formData.redirect,
    perm: formData.perm,
    alwaysShow: formData.alwaysShow,
    keepAlive: formData.keepAlive,
    params: formData.params?.map((item) => ({ ...item })) ?? [],
  };
}

/**
 * 保留各类型已填写内容，避免切换类型时丢失草稿
 */
function syncCurrentMenuTypeDraft(): void {
  saveMenuTypeDraft(currentMenuType.value);
  restoreMenuTypeDraft(currentMenuType.value);
}

function restoreMenuTypeDraft(type: MenuTypeEnum): void {
  const draft = menuTypeDrafts[type] ?? {};
  Object.assign(formData, {
    routeName: undefined,
    routePath: undefined,
    component: undefined,
    externalUrl: undefined,
    icon: undefined,
    redirect: undefined,
    perm: undefined,
    alwaysShow: undefined,
    keepAlive: undefined,
    params: [],
    ...draft,
    type,
  });

  applyMenuTypeDefaults();
}

/**
 * 替换表单数据，避免上一次编辑残留字段
 */
function assignFormData(data: MenuForm): void {
  Object.keys(formData).forEach((key) => {
    delete (formData as Record<string, unknown>)[key];
  });
  Object.assign(formData, data);

  resetMenuTypeDrafts();
  currentMenuType.value = getMenuType(data.type);
  saveMenuTypeDraft(currentMenuType.value);
  syncCurrentMenuTypeDraft();
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
 * 打开新增/编辑菜单弹窗。
 *
 * @param parentId 父菜单 ID（新增子菜单时传入）
 * @param menuId 菜单 ID（编辑时传入）
 */
async function openDialog(parentId?: string, menuId?: string): Promise<void> {
  const data = await MenuAPI.getOptions(true);
  menuOptions.value = [{ value: "0", label: "顶级菜单", children: data }];

  dialogState.visible = true;
  if (menuId) {
    dialogState.title = "编辑菜单";
    const form = await MenuAPI.getFormData(menuId);
    assignFormData(form);
  } else {
    dialogState.title = "新增菜单";
    const nextParentId = parentId?.toString() ?? "0";
    assignFormData({
      ...initialFormData,
      parentId: nextParentId,
      type: getDefaultMenuType(nextParentId),
    });
  }
}

/**
 * 补齐当前菜单类型的默认字段
 */
function applyMenuTypeDefaults(): void {
  if (formData.type === MenuTypeEnum.CATALOG) {
    formData.alwaysShow ??= 0;
  }

  if (formData.type === MenuTypeEnum.MENU) {
    formData.keepAlive ??= 1;
    formData.params ??= [];
  }

  if (formData.type === MenuTypeEnum.EXTERNAL) {
    formData.params = [];
  }

  if (formData.type === MenuTypeEnum.EXTERNAL && formData.component === "iframe") {
    formData.keepAlive ??= 1;
  }

  if (formData.type === MenuTypeEnum.BUTTON) {
    formData.icon = undefined;
  }
}

/**
 * 菜单类型切换事件
 */
function handleMenuTypeChange(): void {
  const nextType = getMenuType(formData.type);
  if (currentMenuType.value === nextType) return;

  saveMenuTypeDraft(currentMenuType.value);
  currentMenuType.value = nextType;
  restoreMenuTypeDraft(nextType);

  nextTick(() => menuFormRef.value?.clearValidate());
}

/**
 * 外链组件切换事件（新标签页 → 系统内嵌）
 */
function handleComponentChange(): void {
  if (formData.component === "iframe") {
    formData.keepAlive ??= 1;
  }

  nextTick(() => menuFormRef.value?.clearValidate(["routeName", "routePath"]));
}

/**
 * 切换缓存状态后刷新页面标识校验
 */
function handleKeepAliveChange(): void {
  menuFormRef.value?.clearValidate("routeName");
}

/**
 * 校验并提交菜单表单。
 */
async function handleSubmit(): Promise<void> {
  const valid = await menuFormRef.value?.validate().then(
    () => true,
    () => false
  );
  if (!valid) return;

  const menuId = formData.id;
  if (menuId && formData.parentId === menuId) {
    ElMessage.error("父级菜单不能为当前菜单");
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
  if (!menuId) {
    ElMessage.warning("请勾选删除项");
    return;
  }

  try {
    await ElMessageBox.confirm("确认删除已选中的数据项?", "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
  } catch {
    ElMessage.info("已取消删除");
    return;
  }

  loading.value = true;
  try {
    await MenuAPI.deleteById(menuId);
    ElMessage.success("删除成功");
    fetchData();
  } finally {
    loading.value = false;
  }
}

/**
 * 关闭弹窗并重置表单。
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
.menu-form {
  padding-right: 4px;
}

.menu-form :deep(.el-form-item__label) {
  white-space: nowrap;
}

.menu-type-field {
  width: 100%;
}

.menu-type-group {
  display: flex;
  width: 100%;
}

.menu-type-group :deep(.el-radio-button) {
  flex: 1;
}

.menu-type-group :deep(.el-radio-button__inner) {
  width: 100%;
}

.menu-type-hint {
  margin-top: 8px;
  font-size: 12px;
  line-height: 1.4;
  color: var(--el-text-color-secondary);
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

.menu-param-row__action.is-add {
  color: var(--el-color-success);
}

.menu-param-row__action.is-delete {
  color: var(--el-color-danger);
}

.menu-name-cell {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
}

.menu-name-cell__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  min-width: 18px;
  margin-right: 6px;
}

.menu-name-cell__text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
