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

      <el-table
        ref="dataTableRef"
        v-loading="loading"
        border
        row-key="id"
        :data="list"
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
            <el-tag v-if="scope.row.type === MenuTypeEnum.BUTTON" type="danger">按钮</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="路由名称" align="left" width="150" prop="routeName" />
        <el-table-column label="路由路径" align="left" width="150" prop="routePath" />
        <el-table-column label="组件路径" align="left" width="250" prop="component" />
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
              v-if="scope.row.type === MenuTypeEnum.CATALOG || scope.row.type === MenuTypeEnum.MENU"
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
    </el-card>

    <el-drawer
      v-model="dialogState.visible"
      :title="dialogState.title"
      :size="drawerSize"
      @close="closeDialog"
    >
      <el-form ref="menuFormRef" :model="formData" :rules="rules" label-width="100px">
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
          <el-radio-group v-model="formData.type" @change="handleMenuTypeChange">
            <el-radio :value="MenuTypeEnum.CATALOG">目录</el-radio>
            <el-radio :value="MenuTypeEnum.MENU">菜单</el-radio>
            <el-radio :value="MenuTypeEnum.BUTTON">按钮</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          v-if="formData.type === MenuTypeEnum.MENU && !isExternalLink"
          prop="routeName"
        >
          <template #label>
            <div class="flex-y-center">
              路由名称
              <el-tooltip placement="bottom" effect="light">
                <template #content>
                  如果需要开启缓存，需保证页面 defineOptions 中的 name 与此处一致，建议使用驼峰式
                </template>
                <el-icon class="ml-1 cursor-pointer">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
          <el-input v-model="formData.routeName" placeholder="User" />
        </el-form-item>

        <el-form-item
          v-if="formData.type === MenuTypeEnum.CATALOG || formData.type === MenuTypeEnum.MENU"
          prop="routePath"
        >
          <template #label>
            <div class="flex-y-center">
              路由路径
              <el-tooltip placement="bottom" effect="light">
                <template #content>
                  定义应用中不同页面对应的 URL 路径，目录需以 / 开头，菜单项不用。例如：系统管理目录
                  /system，系统管理下的用户管理菜单 user。
                </template>
                <el-icon class="ml-1 cursor-pointer">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
          <el-input
            v-if="formData.type === MenuTypeEnum.CATALOG"
            v-model="formData.routePath"
            placeholder="system"
          />
          <el-input v-else v-model="formData.routePath" placeholder="user 或 https://example.com" />
        </el-form-item>

        <el-form-item
          v-if="formData.type === MenuTypeEnum.MENU && !isExternalLink"
          prop="component"
        >
          <template #label>
            <div class="flex-y-center">
              组件路径
              <el-tooltip placement="bottom" effect="light">
                <template #content>
                  组件页面完整路径，相对于 src/views/，如 system/user/index，缺省后缀 .vue
                </template>
                <el-icon class="ml-1 cursor-pointer">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </div>
          </template>

          <el-input v-model="formData.component" placeholder="system/user/index" style="width: 95%">
            <template v-if="formData.type === MenuTypeEnum.MENU" #prepend>src/views/</template>
            <template v-if="formData.type === MenuTypeEnum.MENU" #append>.vue</template>
          </el-input>
        </el-form-item>

        <el-form-item v-if="formData.type === MenuTypeEnum.MENU && !isExternalLink">
          <template #label>
            <div class="flex-y-center">
              路由参数
              <el-tooltip placement="bottom" effect="light">
                <template #content>
                  组件页面使用 `useRoute().query.参数名` 获取路由参数值。
                </template>
                <el-icon class="ml-1 cursor-pointer">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </div>
          </template>

          <div v-if="!formData.params || formData.params.length === 0">
            <el-button type="success" plain @click="formData.params = [{ key: '', value: '' }]">
              添加路由参数
            </el-button>
          </div>

          <div v-else>
            <div v-for="(item, index) in formData.params" :key="index">
              <el-input v-model="item.key" placeholder="参数名" style="width: 100px" />

              <span class="mx-1">=</span>

              <el-input v-model="item.value" placeholder="参数名" style="width: 100px" />

              <el-icon
                v-if="formData.params.indexOf(item) === formData.params.length - 1"
                class="ml-2 cursor-pointer color-[var(--el-color-success)]"
                style="vertical-align: -0.15em"
                @click="formData.params.push({ key: '', value: '' })"
              >
                <CirclePlusFilled />
              </el-icon>
              <el-icon
                class="ml-2 cursor-pointer color-[var(--el-color-danger)]"
                style="vertical-align: -0.15em"
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

        <el-form-item v-if="formData.type !== MenuTypeEnum.BUTTON" prop="visible" label="显示状态">
          <el-radio-group v-model="formData.visible">
            <el-radio :value="CommonStatus.ENABLED">显示</el-radio>
            <el-radio :value="CommonStatus.DISABLED">隐藏</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          v-if="formData.type === MenuTypeEnum.CATALOG || formData.type === MenuTypeEnum.MENU"
        >
          <template #label>
            <div class="flex-y-center">
              始终显示
              <el-tooltip placement="bottom" effect="light">
                <template #content>
                  选择"是"，即使目录或菜单下只有一个子节点，也会显示父节点。
                  <br />
                  选择"否"，如果目录或菜单下只有一个子节点，则只显示该子节点，隐藏父节点。
                  <br />
                  如果是叶子节点，请选择"否"。
                </template>
                <el-icon class="ml-1 cursor-pointer">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </div>
          </template>

          <el-radio-group v-model="formData.alwaysShow">
            <el-radio :value="1">是</el-radio>
            <el-radio :value="0">否</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          v-if="formData.type === MenuTypeEnum.MENU && !isExternalLink"
          label="缓存页面"
        >
          <el-radio-group v-model="formData.keepAlive">
            <el-radio :value="1">开启</el-radio>
            <el-radio :value="0">关闭</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input-number
            v-model="formData.sort"
            style="width: 100px"
            controls-position="right"
            :min="0"
          />
        </el-form-item>

        <!-- 权限标识 -->
        <el-form-item v-if="formData.type === MenuTypeEnum.BUTTON" label="权限标识" prop="perm">
          <el-input v-model="formData.perm" placeholder="sys:user:create" />
        </el-form-item>

        <el-form-item v-if="formData.type !== MenuTypeEnum.BUTTON" label="图标" prop="icon">
          <!-- 图标选择器 -->
          <icon-select v-model="formData.icon" />
        </el-form-item>

        <el-form-item v-if="formData.type === MenuTypeEnum.CATALOG" label="跳转路由">
          <el-input v-model="formData.redirect" placeholder="跳转路由" />
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

const formData = reactive<MenuForm>({ ...initialFormData });

// 多租户关闭时隐藏菜单范围字段。
const showMenuScope = computed(() => isTenantEnabled());

// 抽屉宽度（响应式）。
const drawerSize = computed(() => (appStore.device === DeviceEnum.DESKTOP ? "600px" : "90%"));

// 是否外链：菜单类型 + 以 http(s) 开头的路由路径。
const isExternalLink = computed(
  () =>
    formData.type === MenuTypeEnum.MENU &&
    !!formData.routePath &&
    /^https?:\/\//.test(formData.routePath)
);

const validateRouteName = (_: unknown, value: string, callback: (error?: Error) => void) => {
  if (formData.type === MenuTypeEnum.MENU && !isExternalLink.value && !value) {
    callback(new Error("请输入路由名称"));
    return;
  }
  callback();
};

const validateComponent = (_: unknown, value: string, callback: (error?: Error) => void) => {
  if (formData.type === MenuTypeEnum.MENU && !isExternalLink.value && !value) {
    callback(new Error("请输入组件路径"));
    return;
  }
  callback();
};

const rules: FormRules<MenuForm> = {
  parentId: [{ required: true, message: "请选择父级菜单", trigger: "blur" }],
  name: [{ required: true, message: "请输入菜单名称", trigger: "blur" }],
  type: [{ required: true, message: "请选择菜单类型", trigger: "blur" }],
  routeName: [{ validator: validateRouteName, trigger: "blur" }],
  routePath: [{ required: true, message: "请输入路由路径", trigger: "blur" }],
  component: [{ validator: validateComponent, trigger: "blur" }],
  visible: [{ required: true, message: "请选择显示状态", trigger: "change" }],
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
 * 重置表单数据和验证状态
 */
function resetForm(): void {
  menuFormRef.value?.resetFields();
  menuFormRef.value?.clearValidate();
  Object.keys(formData).forEach((key) => {
    delete (formData as Record<string, unknown>)[key];
  });
  Object.assign(formData, initialFormData);
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
    Object.assign(formData, form);
  } else {
    dialogState.title = "新增菜单";
    formData.parentId = parentId?.toString();
  }
}

/** 菜单类型切换事件 */
function handleMenuTypeChange(): void {
  if (formData.type === MenuTypeEnum.MENU) {
    if (formData.routePath === undefined) {
      formData.routePath = initialFormData.routePath;
    }
    if (formData.component === undefined) {
      formData.component = initialFormData.component;
    }
  }
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

  loading.value = true;
  try {
    if (menuId) {
      await MenuAPI.update(menuId, formData);
      ElMessage.success("修改成功");
    } else {
      await MenuAPI.create(formData);
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
