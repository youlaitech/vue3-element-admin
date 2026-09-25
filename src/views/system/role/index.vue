<!-- 角色管理 -->
<template>
  <div class="page-container page-container--split role-page">
    <aside class="page-aside" :class="{ 'is-collapsed': sidebarCollapsed }">
      <div class="page-aside__inner">
        <div class="role-list">
          <div class="mb-2 flex items-center gap-2">
            <el-input
              v-model="params.keywords"
              class="flex-1"
              placeholder="角色名称"
              clearable
              @keyup.enter="handleSearch"
              @clear="handleSearch"
            />
            <el-button
              v-hasPerm="'sys:role:create'"
              type="primary"
              :icon="Plus"
              @click="handleCreateClick()"
            />
          </div>

          <el-scrollbar v-loading="loading" class="role-list__scroll">
            <div
              v-for="row in list"
              :key="row.id"
              class="role-list__item"
              :class="{ 'is-active': row.id === currentRole?.id }"
              @click="handleRoleClick(row)"
            >
              <div class="role-list__info">
                <span class="role-list__name" :title="row.name">{{ row.name }}</span>
                <span class="role-list__code" :title="row.code">{{ row.code }}</span>
              </div>
              <div v-if="row.code !== ROLE_ROOT" class="role-list__actions">
                <el-button
                  v-hasPerm="'sys:role:update'"
                  link
                  type="primary"
                  @click.stop="handleEditClick(row.id)"
                >
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button
                  v-hasPerm="'sys:role:delete'"
                  link
                  type="danger"
                  @click.stop="handleDelete(row.id)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>

            <el-empty
              v-if="!loading && list.length === 0"
              :image-size="60"
              description="暂无角色"
            />
          </el-scrollbar>

          <div class="flex items-center justify-between gap-2 pt-2">
            <span class="text-12px text-[var(--el-text-color-secondary)]">共 {{ total }} 个</span>
            <el-pagination
              v-model:current-page="params.pageNum"
              :page-size="params.pageSize"
              :total="total"
              layout="prev, pager, next"
              size="small"
              background
              @current-change="handlePageChange"
            />
          </div>
        </div>
      </div>

      <button
        class="page-aside__toggle"
        :title="sidebarCollapsed ? '展开角色列表' : '收起角色列表'"
        type="button"
        @click="sidebarCollapsed = !sidebarCollapsed"
      >
        <el-icon :size="14">
          <ArrowLeft v-if="!sidebarCollapsed" />
          <ArrowRight v-else />
        </el-icon>
      </button>
    </aside>

    <div class="page-main">
      <el-card v-if="currentRole" ref="permWrapperRef" class="page-content" shadow="never">
        <div class="role-perm__header">
          <div class="role-perm__row">
            <span class="role-perm__title">功能权限</span>
            <el-tag type="primary" effect="plain">{{ currentRole.name }}</el-tag>
            <el-tag v-if="isRootRole" type="warning" effect="plain">
              超级管理员拥有全部权限，无需分配
            </el-tag>

            <el-button
              v-hasPerm="'sys:role:assign'"
              class="ml-auto"
              type="primary"
              :loading="saving"
              :disabled="isRootRole"
              @click="handleSavePerm"
            >
              保存
            </el-button>
          </div>

          <div class="role-perm__row">
            <el-input
              v-model="permKeywords"
              class="role-perm__search"
              placeholder="权限名称"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>

            <div class="ml-auto flex items-center gap-3">
              <el-segmented v-model="checkMode" :options="CHECK_MODE_OPTIONS" />

              <el-tooltip :content="isAllCollapsed ? '展开' : '收缩'" placement="top">
                <el-button class="page-icon-btn" @click="toggleAllGroups">
                  <span v-if="isAllCollapsed" class="i-svg:add-box" />
                  <span v-else class="i-svg:checkbox-indeterminate" />
                </el-button>
              </el-tooltip>

              <el-tooltip content="刷新" placement="top">
                <el-button class="page-icon-btn" @click="handleRefreshPerm">
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
        </div>

        <div class="page-table-wrapper">
          <el-table
            v-loading="permLoading"
            class="page-table"
            :data="displayRows"
            row-key="id"
            height="100%"
            border
            :row-class-name="resolveRowClass"
          >
            <el-table-column label="权限名称" min-width="240">
              <template #default="{ row }">
                <div
                  class="role-perm__cell"
                  :class="{ 'is-group': row.group }"
                  :style="{ paddingLeft: `${row.depth * 18}px` }"
                >
                  <el-icon
                    v-if="row.group"
                    class="role-perm__caret"
                    :size="14"
                    @click.stop="toggleGroup(row.id)"
                  >
                    <CaretBottom v-if="!collapsedIds.has(row.id)" />
                    <CaretRight v-else />
                  </el-icon>
                  <span v-else class="role-perm__caret-space" />
                  <el-checkbox
                    :model-value="checkedIds.has(row.id)"
                    @change="(checked) => handleNodeCheck(row.id, checked)"
                  />
                  <span class="role-perm__name" :title="row.name">{{ row.name }}</span>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="权限项" min-width="360">
              <template #default="{ row }">
                <div class="flex flex-wrap gap-x-4 gap-y-1">
                  <el-checkbox
                    v-for="btn in row.buttons"
                    :key="btn.id"
                    :model-value="checkedIds.has(btn.id)"
                    @change="(checked) => handleNodeCheck(btn.id, checked)"
                  >
                    {{ btn.name }}
                  </el-checkbox>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>

      <el-card v-else class="page-content role-page__empty" shadow="never">
        <el-empty description="请先在左侧选择角色" />
      </el-card>
    </div>

    <el-dialog
      v-model="dialogState.visible"
      :title="dialogState.title"
      width="600px"
      @close="closeDialog"
    >
      <el-form ref="roleFormRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入角色名称" />
        </el-form-item>

        <el-form-item label="角色编码" prop="code">
          <el-input v-model="formData.code" placeholder="请输入角色编码" />
        </el-form-item>

        <el-form-item label="数据权限" prop="dataScope">
          <el-select v-model="formData.dataScope" placeholder="请选择数据权限" style="width: 100%">
            <el-option
              v-for="item in dataScopeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item
          v-if="formData.dataScope === DATA_SCOPE_CUSTOM"
          label="选择部门"
          prop="deptIds"
        >
          <el-tree-select
            v-model="formData.deptIds"
            :data="deptOptions"
            multiple
            :render-after-expand="false"
            check-strictly
            placeholder="请选择部门"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :value="CommonStatus.ENABLED">正常</el-radio>
            <el-radio :value="CommonStatus.DISABLED">停用</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input-number
            v-model="formData.sort"
            controls-position="right"
            :min="0"
            style="width: 100px"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">确定</el-button>
          <el-button @click="closeDialog">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { useFullscreen } from "@vueuse/core";
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus";
import {
  ArrowLeft,
  ArrowRight,
  CaretBottom,
  CaretRight,
  Delete,
  Edit,
  FullScreen,
  Plus,
  Refresh,
  Search,
} from "@element-plus/icons-vue";

import RoleAPI from "@/api/system/role";
import type { RoleForm, RoleItem, RoleQueryParams } from "@/api/system/role";
import MenuAPI from "@/api/system/menu";
import type { MenuItem } from "@/api/system/menu";
import DeptAPI from "@/api/system/dept";
import type { OptionItem } from "@/api/common";
import { usePageTable } from "@/composables";
import { CommonStatus } from "@/enums";
import { ROLE_ROOT } from "@/constants";

defineOptions({
  name: "Role",
  inheritAttrs: false,
});

/** 权限表格行，按钮权限挂在所属菜单行的 buttons 上而不单独成行 */
interface PermRow {
  /** 节点 ID */
  id: string;
  /** 节点名称 */
  name: string;
  /** 是否为目录分组行 */
  group: boolean;
  /** 层级，仅用于缩进 */
  depth: number;
  /** 行内展示的按钮权限 */
  buttons: PermRow[];
}

// 左侧角色列表折叠状态
const sidebarCollapsed = ref(false);

const roleFormRef = ref<FormInstance>();
const permWrapperRef = ref<HTMLElement | null>(null);
const { toggle: toggleFullscreen } = useFullscreen(permWrapperRef);

// 自定义数据权限取值
const DATA_SCOPE_CUSTOM = 5;

const dataScopeOptions = [
  { label: "全部数据", value: 1 },
  { label: "部门及子部门数据", value: 2 },
  { label: "本部门数据", value: 3 },
  { label: "本人数据", value: 4 },
  { label: "自定义部门数据", value: DATA_SCOPE_CUSTOM },
];

// 左侧角色列表分页数据管理
const { loading, list, total, params, fetchData } = usePageTable<RoleItem, RoleQueryParams>({
  initialParams: {
    pageNum: 1,
    pageSize: 20,
    keywords: "",
  },
  request: RoleAPI.getPage,
});

// 当前选中角色，右侧权限表格据此联动
const currentRole = ref<RoleItem>();
// 当前选中角色是否为超级管理员：权限固定为全部，不允许编辑与分配
const isRootRole = computed(() => currentRole.value?.code === ROLE_ROOT);

// 权限表格数据与勾选状态
const permRows = ref<PermRow[]>([]);
const checkedIds = ref(new Set<string>());
const permLoading = ref(false);
const saving = ref(false);
const permKeywords = ref("");

/** 勾选模式：父子联动 / 节点独立 */
type CheckMode = "linked" | "independent";

const CHECK_MODE_OPTIONS: { value: CheckMode; label: string }[] = [
  { value: "linked", label: "父子联动" },
  { value: "independent", label: "节点独立" },
];

const checkMode = ref<CheckMode>("linked");

// 折叠的目录 ID，折叠后其下菜单行不展示
const collapsedIds = ref(new Set<string>());

// 节点祖先链，勾选子级时用于回填父级
const nodeParents = new Map<string, string[]>();
// 节点及其全部后代的 ID
const nodeFamilies = new Map<string, string[]>();

// 菜单树只请求一次，切换角色时复用
let menuTreeLoaded = false;

/**
 * 整理菜单层级
 * 后端返回的可能是树，也可能是扁平列表，扁平数据按 parentId 就地组装成树
 *
 * @param list 菜单列表
 * @returns 顶层菜单列表
 */
function normalizeMenuTree(list: MenuItem[]): MenuItem[] {
  const hasNested = list.some((menu) => (menu.children?.length ?? 0) > 0);
  if (hasNested) return list;

  const nodeMap = new Map<string, MenuItem>();
  list.forEach((menu) => nodeMap.set(String(menu.id), { ...menu }));

  const roots: MenuItem[] = [];
  nodeMap.forEach((menu) => {
    const parent = nodeMap.get(String(menu.parentId ?? "0"));
    if (parent) {
      parent.children = [...(parent.children ?? []), menu];
    } else {
      roots.push(menu);
    }
  });
  return roots;
}

/**
 * 菜单树转权限表格行
 * 目录节点占一行做分组标题，菜单节点占一行并把它下面的按钮权限摊到行内
 *
 * @param nodes 菜单节点列表
 * @param depth 当前层级
 * @param ancestors 祖先 ID 链
 * @returns 权限表格行列表
 */
function buildPermRows(nodes: MenuItem[], depth = 0, ancestors: string[] = []): PermRow[] {
  const rows: PermRow[] = [];

  nodes.forEach((node) => {
    const id = String(node.id);
    const children = node.children ?? [];
    const subMenus = children.filter((child) => child.type !== "B");
    const buttons: PermRow[] = children
      .filter((child) => child.type === "B")
      .map((child) => ({
        id: String(child.id),
        name: child.name ?? "",
        group: false,
        depth: depth + 1,
        buttons: [],
      }));

    rows.push({
      id,
      name: node.name ?? "",
      group: subMenus.length > 0,
      depth,
      buttons,
    });
    buttons.forEach((btn) => {
      nodeParents.set(btn.id, [...ancestors, id]);
      nodeFamilies.set(btn.id, [btn.id]);
    });

    const childRows = buildPermRows(subMenus, depth + 1, [...ancestors, id]);
    rows.push(...childRows);

    nodeParents.set(id, ancestors);
    nodeFamilies.set(id, [
      id,
      ...buttons.map((btn) => btn.id),
      ...childRows.flatMap((row) => nodeFamilies.get(row.id) ?? []),
    ]);
  });

  return rows;
}

/**
 * 按关键字过滤权限行
 * 分组内任一行命中即整组保留，避免只剩零散菜单丢失所属目录
 *
 * @param rows 权限表格行列表
 * @param keyword 权限名称关键字
 * @returns 过滤后的权限表格行列表
 */
function filterPermRows(rows: PermRow[], keyword: string): PermRow[] {
  if (!keyword) return rows;

  const result: PermRow[] = [];
  let groupRow: PermRow | null = null;
  let groupRows: PermRow[] = [];
  let groupHit = false;

  /**
   * 判断权限行是否命中搜索关键字
   */
  const hitRow = (row: PermRow) =>
    row.name.includes(keyword) || row.buttons.some((btn) => btn.name.includes(keyword));

  /**
   * 把命中的权限分组写入结果
   */
  const flushGroup = () => {
    if (groupRow && groupHit) {
      result.push(groupRow, ...groupRows);
    }
    groupRow = null;
    groupRows = [];
    groupHit = false;
  };

  rows.forEach((row) => {
    if (row.group) {
      flushGroup();
      groupRow = row;
      groupHit = hitRow(row);
      return;
    }

    if (!groupRow) {
      if (hitRow(row)) result.push(row);
      return;
    }

    if (hitRow(row)) groupHit = true;
    groupRows.push(row);
  });

  flushGroup();
  return result;
}

// 权限表格渲染数据
const displayRows = computed(() => {
  const rows = filterPermRows(permRows.value, permKeywords.value);
  // 搜索时全部展开，避免命中的菜单被折叠藏起来
  if (permKeywords.value || collapsedIds.value.size === 0) return rows;

  const visible: PermRow[] = [];
  let collapsedDepth: number | null = null;

  rows.forEach((row) => {
    if (collapsedDepth !== null && row.depth > collapsedDepth) return;

    collapsedDepth = null;
    visible.push(row);
    if (row.group && collapsedIds.value.has(row.id)) {
      collapsedDepth = row.depth;
    }
  });

  return visible;
});

// 带下级菜单行的节点
const collapsibleIds = computed(() =>
  permRows.value.filter((row) => row.group).map((row) => row.id)
);

// 带下级菜单行的节点是否都已折叠
const isAllCollapsed = computed(
  () =>
    collapsibleIds.value.length > 0 &&
    collapsibleIds.value.every((id) => collapsedIds.value.has(id))
);

/**
 * 拉取菜单树并生成权限表格行
 */
async function loadMenuTree(): Promise<void> {
  if (menuTreeLoaded) return;

  const menuList = await MenuAPI.getList({});
  permRows.value = buildPermRows(normalizeMenuTree(menuList));
  menuTreeLoaded = true;
}

/**
 * 分组行加浅底色，和菜单行区分开
 *
 * @param param0 表格行数据
 * @returns 行样式类名
 */
function resolveRowClass({ row }: { row: PermRow }): string {
  return row.group ? "role-perm__row--group" : "";
}

/**
 * 拉取指定角色已分配的菜单权限并回显
 *
 * @param roleId 角色 ID
 */
async function loadRolePerm(roleId?: string): Promise<void> {
  if (!roleId) return;

  permLoading.value = true;
  try {
    await loadMenuTree();
    // 超级管理员拥有全部权限，不回显勾选
    if (currentRole.value?.code === ROLE_ROOT) {
      checkedIds.value = new Set();
      return;
    }
    const menuIds = await RoleAPI.getRoleMenuIds(roleId);
    checkedIds.value = new Set(menuIds.map((menuId) => String(menuId)));
  } finally {
    permLoading.value = false;
  }
}

/**
 * 拉取角色列表并保持右侧选中项有效
 *
 * @param preferRoleId 优先选中的角色 ID，缺省沿用当前选中项
 */
async function fetchRoles(preferRoleId?: string): Promise<void> {
  await fetchData();

  const targetId = preferRoleId ?? currentRole.value?.id;
  currentRole.value = list.value.find((row) => row.id === targetId) ?? list.value[0];
  await loadRolePerm(currentRole.value?.id);
}

/**
 * 按关键字查询角色
 */
function handleSearch(): void {
  params.pageNum = 1;
  fetchRoles();
}

/**
 * 角色列表翻页
 */
function handlePageChange(): void {
  fetchRoles();
}

/**
 * 选中角色，右侧权限表格随之切换
 *
 * @param row 角色行
 */
async function handleRoleClick(row: RoleItem): Promise<void> {
  if (row.id === currentRole.value?.id) return;
  currentRole.value = row;
  await loadRolePerm(row.id);
}

/**
 * 勾选或取消权限节点
 * 父子联动时向下级联并回填父级，节点独立时只作用于当前节点
 *
 * @param nodeId 权限节点 ID
 * @param checked 是否勾选
 */
function handleNodeCheck(nodeId: string, checked: boolean | string | number): void {
  const isChecked = Boolean(checked);

  if (checkMode.value === "independent") {
    if (isChecked) {
      checkedIds.value.add(nodeId);
    } else {
      checkedIds.value.delete(nodeId);
    }
    return;
  }

  const family = nodeFamilies.get(nodeId) ?? [nodeId];
  if (isChecked) {
    [...family, ...(nodeParents.get(nodeId) ?? [])].forEach((id) => checkedIds.value.add(id));
  } else {
    family.forEach((id) => checkedIds.value.delete(id));
  }
}

/**
 * 折叠或展开指定目录
 *
 * @param groupId 目录 ID
 */
function toggleGroup(groupId: string): void {
  if (collapsedIds.value.has(groupId)) {
    collapsedIds.value.delete(groupId);
  } else {
    collapsedIds.value.add(groupId);
  }
}

/**
 * 一键折叠或展开全部目录
 */
function toggleAllGroups(): void {
  collapsedIds.value = isAllCollapsed.value ? new Set() : new Set(collapsibleIds.value);
}

/**
 * 重新拉取当前角色的菜单权限
 */
async function handleRefreshPerm(): Promise<void> {
  await loadRolePerm(currentRole.value?.id);
}

/**
 * 提交当前角色的菜单权限配置
 */
async function handleSavePerm(): Promise<void> {
  const roleId = currentRole.value?.id;
  if (!roleId) return;

  // 超级管理员权限固定为全部，不支持修改
  if (currentRole.value?.code === ROLE_ROOT) {
    ElMessage.warning("超级管理员拥有全部权限，无需分配");
    return;
  }

  const menuIds = Array.from(checkedIds.value)
    .map((menuId) => Number(menuId))
    .filter((menuId) => !Number.isNaN(menuId));

  saving.value = true;
  try {
    await RoleAPI.updateRoleMenus(roleId, menuIds);
    ElMessage.success("分配权限成功");
  } finally {
    saving.value = false;
  }
}

const dialogState = reactive({
  title: "",
  visible: false,
});

const initialFormData: RoleForm = {
  sort: 1,
  status: CommonStatus.ENABLED,
};

const formData = reactive<RoleForm>({ ...initialFormData });

const rules: FormRules<RoleForm> = {
  name: [{ required: true, message: "请输入角色名称", trigger: "blur" }],
  code: [{ required: true, message: "请输入角色编码", trigger: "blur" }],
  dataScope: [{ required: true, message: "请选择数据权限", trigger: "blur" }],
  deptIds: [{ required: true, message: "请选择部门", trigger: "blur" }],
  status: [{ required: true, message: "请选择状态", trigger: "blur" }],
};

// 部门下拉选项（懒加载，新增/编辑时才请求）
const deptOptions = ref<OptionItem[]>([]);

/**
 * 打开角色表单弹窗
 */
function openDialog(): void {
  dialogState.visible = true;
}

/**
 * 关闭角色表单弹窗
 * 同步清理表单数据和校验状态
 */
function closeDialog(): void {
  dialogState.visible = false;
  resetForm();
}

/**
 * 重置角色表单
 */
function resetForm(): void {
  roleFormRef.value?.resetFields();
  roleFormRef.value?.clearValidate();
  Object.keys(formData).forEach((key) => {
    delete (formData as Record<string, unknown>)[key];
  });
  Object.assign(formData, initialFormData);
}

/**
 * 打开新增角色弹窗
 * 部门下拉首次打开时请求，之后复用缓存
 */
async function handleCreateClick(): Promise<void> {
  dialogState.title = "新增角色";
  if (deptOptions.value.length === 0) {
    deptOptions.value = await DeptAPI.getOptions();
  }
  openDialog();
}

/**
 * 打开编辑角色弹窗
 *
 * @param roleId 角色 ID
 */
async function handleEditClick(roleId?: string): Promise<void> {
  if (!roleId) return;
  dialogState.title = "修改角色";
  if (deptOptions.value.length === 0) {
    deptOptions.value = await DeptAPI.getOptions();
  }
  const data = await RoleAPI.getFormData(roleId);
  Object.assign(formData, data);
  openDialog();
}

/**
 * 校验并提交角色表单
 *
 * 非自定义数据权限时丢弃部门 ID
 */
async function handleSubmit(): Promise<void> {
  const valid = await roleFormRef.value?.validate().then(
    () => true,
    () => false
  );
  if (!valid) return;

  const submitData: RoleForm = { ...formData };
  if (submitData.dataScope !== DATA_SCOPE_CUSTOM) {
    submitData.deptIds = undefined;
  }

  loading.value = true;
  try {
    const roleId = formData.id;
    if (roleId) {
      await RoleAPI.update(roleId, submitData);
      ElMessage.success("修改成功");
    } else {
      await RoleAPI.create(submitData);
      ElMessage.success("新增成功");
    }
    closeDialog();
    fetchRoles(roleId);
  } finally {
    loading.value = false;
  }
}

/**
 * 删除角色，删除后右侧联动到剩余角色
 *
 * @param roleId 角色 ID
 */
async function handleDelete(roleId?: string): Promise<void> {
  if (!roleId) return;

  try {
    await ElMessageBox.confirm("确认删除该角色?", "警告", {
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
    await RoleAPI.deleteByIds(roleId);
    ElMessage.success("删除成功");
    fetchRoles();
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchRoles();
});
</script>

<style lang="scss" scoped>
.role-page {
  --page-aside-width: 280px;
}

.role-page__empty {
  align-items: center;
  justify-content: center;
}

.role-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  padding: 12px;

  &__scroll {
    flex: 1 1 auto;
    min-height: 0;
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 7px 8px;
    cursor: pointer;
    border-radius: 6px;
    transition: background-color 0.15s;

    &:hover {
      background-color: var(--el-fill-color-light);
    }

    &.is-active {
      background-color: var(--el-color-primary-light-9);
    }
  }

  &__info {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    min-width: 0;
    line-height: 1.35;
  }

  &__name {
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    white-space: nowrap;
  }

  &__code {
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    white-space: nowrap;
  }

  &__item.is-active &__name {
    color: var(--el-color-primary);
  }

  &__actions {
    flex-shrink: 0;
    margin-left: 4px;

    .el-button + .el-button {
      margin-left: 4px;
    }

    .el-button {
      padding: 0;
      opacity: 0;
      transition: opacity 0.15s;
    }
  }

  &__item:hover &__actions .el-button,
  &__item.is-active &__actions .el-button {
    opacity: 1;
  }
}

.role-perm {
  &__header {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: var(--page-gap);
  }

  &__row {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  // 类名控制宽度，UnoCSS 原子类会被按需注入的 .el-input 宽度覆盖
  &__search {
    width: 220px;
  }

  &__title {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  &__cell {
    display: flex;
    gap: 8px;
    align-items: center;

    &.is-group {
      font-weight: 600;
    }

    .el-checkbox {
      margin-right: 0;
    }
  }

  &__caret {
    flex-shrink: 0;
    color: var(--el-text-color-secondary);
    cursor: pointer;

    &:hover {
      color: var(--el-color-primary);
    }
  }

  &__caret-space {
    flex-shrink: 0;
    width: 14px;
  }

  &__name {
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 13px;
    color: var(--el-text-color-primary);
    white-space: nowrap;
  }

  // 目录行做分组标题，浅底色把它和下面的菜单行区分开
  :deep(.role-perm__row--group) {
    background-color: var(--el-fill-color-light);

    td.el-table__cell {
      background-color: var(--el-fill-color-light);
    }
  }
}
</style>
