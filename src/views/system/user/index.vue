<!-- 用户管理 -->
<template>
  <div class="page-container user-page">
    <aside class="user-aside" :class="{ 'is-collapsed': sidebarCollapsed }">
      <div class="user-aside__inner">
        <UserDeptTree v-model="params.deptId" @node-click="handleQuery" />
      </div>
      <button class="user-aside__toggle" @click="sidebarCollapsed = !sidebarCollapsed">
        <el-icon :size="14">
          <ArrowLeft v-if="!sidebarCollapsed" />
          <ArrowRight v-else />
        </el-icon>
      </button>
    </aside>

    <div class="user-main">
      <el-card class="page-search" shadow="never">
        <el-form ref="queryFormRef" :model="params" :inline="true" label-width="auto">
          <el-form-item label="关键字" prop="keywords">
            <el-input
              v-model="params.keywords"
              class="user-search__keyword"
              placeholder="用户名/昵称/手机号"
              clearable
              @keyup.enter="handleQuery"
            />
          </el-form-item>

          <el-form-item label="状态" prop="status">
            <el-select v-model="params.status" placeholder="全部" clearable style="width: 112px">
              <el-option label="正常" :value="CommonStatus.ENABLED" />
              <el-option label="禁用" :value="CommonStatus.DISABLED" />
            </el-select>
          </el-form-item>

          <el-form-item label="创建时间" prop="createTime">
            <el-date-picker
              v-model="params.createTime"
              :editable="false"
              type="daterange"
              range-separator="~"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              style="width: 240px"
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
            <el-button v-hasPerm="['sys:user:create']" type="primary" @click="handleCreateClick">
              新增
            </el-button>
            <el-button
              v-hasPerm="'sys:user:delete'"
              type="danger"
              :disabled="!hasSelection"
              @click="handleDelete()"
            >
              删除
            </el-button>
          </div>
          <div class="page-toolbar__right">
            <el-tooltip content="导入" placement="top">
              <el-button
                v-hasPerm="'sys:user:import'"
                class="page-icon-btn"
                @click="openImportDialog"
              >
                <el-icon><Upload /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip content="导出" placement="top">
              <el-button v-hasPerm="'sys:user:export'" class="page-icon-btn" @click="handleExport">
                <el-icon><Download /></el-icon>
              </el-button>
            </el-tooltip>
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
            class="page-table user-table"
            :data="list"
            height="100%"
            border
            highlight-current-row
            row-key="id"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="42" fixed="left" align="center" />
            <el-table-column label="昵称" min-width="140" fixed="left">
              <template #default="scope">
                <div class="user-name-cell">
                  <el-avatar v-if="scope.row.avatar" :src="scope.row.avatar" :size="24" />
                  <span v-else class="user-name-cell__text">
                    {{ getAvatarText(scope.row as UserItem) }}
                  </span>
                  <span>{{ scope.row.nickname || "-" }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="用户名" min-width="120" prop="username" show-overflow-tooltip />
            <el-table-column label="状态" align="center" width="80">
              <template #default="scope">
                <el-tag
                  :type="scope.row.status === CommonStatus.ENABLED ? 'success' : 'danger'"
                  size="small"
                >
                  {{ scope.row.status === CommonStatus.ENABLED ? "正常" : "禁用" }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="性别" align="center" width="70">
              <template #default="scope">
                <el-tag
                  v-if="
                    scope.row.gender === UserGender.MALE || scope.row.gender === UserGender.FEMALE
                  "
                  :type="scope.row.gender === UserGender.MALE ? 'primary' : 'danger'"
                  size="small"
                >
                  <el-icon>
                    <Male v-if="scope.row.gender === UserGender.MALE" />
                    <Female v-else />
                  </el-icon>
                  <span>{{ scope.row.gender === UserGender.MALE ? "男" : "女" }}</span>
                </el-tag>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column label="部门" min-width="140" prop="deptName" show-overflow-tooltip />
            <el-table-column label="角色" prop="roleNames" min-width="160" show-overflow-tooltip />
            <el-table-column label="手机号码" prop="mobile" width="130" />
            <el-table-column label="邮箱" prop="email" min-width="180" show-overflow-tooltip />
            <el-table-column label="创建时间" prop="createTime" width="160" show-overflow-tooltip />
            <el-table-column label="操作" fixed="right" width="200">
              <template #default="scope">
                <div>
                  <el-button
                    v-hasPerm="'sys:user:update'"
                    type="primary"
                    size="small"
                    link
                    @click="handleEditClick(scope.row.id)"
                  >
                    编辑
                  </el-button>
                  <el-button
                    v-hasPerm="'sys:user:delete'"
                    type="danger"
                    size="small"
                    link
                    @click="handleDelete(scope.row.id)"
                  >
                    删除
                  </el-button>
                  <el-button
                    v-hasPerm="'sys:user:reset-password'"
                    type="primary"
                    size="small"
                    link
                    @click="handleResetPassword(scope.row as UserItem)"
                  >
                    重置密码
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <pagination
          v-if="total > 0"
          v-model:total="total"
          v-model:page="params.pageNum"
          v-model:limit="params.pageSize"
          class="page-pagination"
          @pagination="fetchData"
        />
      </el-card>
    </div>

    <!-- 用户表单 -->
    <el-drawer
      v-model="dialogState.visible"
      :title="dialogState.title"
      append-to-body
      :size="drawerSize"
      @close="closeDialog"
    >
      <el-form ref="userFormRef" :model="formData" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="formData.username"
            :readonly="!!formData.id"
            placeholder="请输入用户名"
          />
        </el-form-item>

        <el-form-item label="用户昵称" prop="nickname">
          <el-input v-model="formData.nickname" placeholder="请输入用户昵称" />
        </el-form-item>

        <el-form-item label="所属部门" prop="deptId">
          <el-tree-select
            v-model="formData.deptId"
            placeholder="请选择所属部门"
            :data="deptOptions"
            filterable
            check-strictly
            :render-after-expand="false"
          />
        </el-form-item>

        <el-form-item label="性别" prop="gender">
          <DictSelect v-model="formData.gender" code="gender" />
        </el-form-item>

        <el-form-item label="角色" prop="roleIds">
          <el-select v-model="formData.roleIds" multiple placeholder="请选择">
            <el-option
              v-for="item in roleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="手机号码" prop="mobile">
          <el-input v-model="formData.mobile" placeholder="请输入手机号码" maxlength="11" />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" maxlength="50" />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="formData.status"
            inline-prompt
            active-text="正常"
            inactive-text="禁用"
            :active-value="CommonStatus.ENABLED"
            :inactive-value="CommonStatus.DISABLED"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
          <el-button @click="closeDialog">取 消</el-button>
        </div>
      </template>
    </el-drawer>

    <!-- 用户导入 -->
    <UserImportDialog v-model="importDialogVisible" @import-success="handleQuery()" />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus";

import UserAPI from "@/api/system/user";
import DeptAPI from "@/api/system/dept";
import RoleAPI from "@/api/system/role";
import type { UserForm, UserItem, UserQueryParams } from "@/api/system/user";
import type { OptionItem } from "@/api/common";
import { useAppStore, useUserStore } from "@/stores";
import { usePageTable, useTableSelection } from "@/composables";
import { CommonStatus, DeviceEnum, DialogMode, UserGender } from "@/enums";
import { downloadFile } from "@/utils";

import UserDeptTree from "./components/UserDeptTree.vue";
import UserImportDialog from "./components/UserImportDialog.vue";

defineOptions({
  name: "User",
  inheritAttrs: false,
});

const appStore = useAppStore();
const userStore = useUserStore();

const tableWrapperRef = ref<HTMLElement | null>(null);
const { toggle: toggleFullscreen } = useFullscreen(tableWrapperRef);

const queryFormRef = ref<FormInstance>();
const userFormRef = ref<FormInstance>();
const sidebarCollapsed = ref(false);

/** 分页表格数据管理 */
const { loading, list, total, params, fetchData, handleQuery, handleResetQuery } = usePageTable<
  UserItem,
  UserQueryParams
>({
  initialParams: {
    pageNum: 1,
    pageSize: 10,
  },
  request: UserAPI.getPage,
  onBeforeReset: () => queryFormRef.value?.resetFields(),
});

const { selectedIds, hasSelection, handleSelectionChange } = useTableSelection<UserItem>();

const dialogState = reactive({
  visible: false,
  title: "",
  mode: DialogMode.CREATE,
});

const importDialogVisible = ref(false);

const initialFormData: UserForm = {
  status: CommonStatus.ENABLED,
};

const formData = reactive<UserForm>({ ...initialFormData });

const deptOptions = ref<OptionItem[]>([]);
const roleOptions = ref<OptionItem[]>([]);

const drawerSize = computed(() => (appStore.device === DeviceEnum.DESKTOP ? "600px" : "90%"));

const rules: FormRules<UserForm> = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  nickname: [{ required: true, message: "请输入用户昵称", trigger: "blur" }],
  deptId: [{ required: true, message: "请选择所属部门", trigger: "change" }],
  roleIds: [{ required: true, message: "请选择用户角色", trigger: "change" }],
  email: [{ type: "email", message: "请输入正确的邮箱地址", trigger: "blur" }],
  mobile: [{ pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号码", trigger: "blur" }],
};

/**
 * 取昵称/用户名首字母作为头像占位文本。
 *
 * @param row 用户行数据
 */
function getAvatarText(row: UserItem): string {
  const text = row.nickname || row.username || "?";
  return text.slice(0, 1).toUpperCase();
}

/**
 * 加载表单所需的下拉选项（角色 + 部门），并行请求。
 */
async function loadFormOptions(): Promise<void> {
  [roleOptions.value, deptOptions.value] = await Promise.all([
    RoleAPI.getOptions(),
    DeptAPI.getOptions(),
  ]);
}

/**
 * 打开用户表单弹窗。
 */
function openDialog(): void {
  dialogState.visible = true;
}

/**
 * 关闭用户表单弹窗并清理临时状态。
 */
function closeDialog(): void {
  dialogState.visible = false;
  resetForm();
}

/**
 * 重置表单数据和验证状态。
 */
function resetForm(): void {
  userFormRef.value?.resetFields();
  userFormRef.value?.clearValidate();
  Object.keys(formData).forEach((key) => {
    delete (formData as Record<string, unknown>)[key];
  });
  Object.assign(formData, initialFormData);
}

/**
 * 打开新增弹窗。
 */
async function handleCreateClick(): Promise<void> {
  dialogState.title = "新增用户";
  dialogState.mode = DialogMode.CREATE;
  await loadFormOptions();
  openDialog();
}

/**
 * 打开编辑弹窗并回填数据。
 */
async function handleEditClick(id: string): Promise<void> {
  dialogState.title = "修改用户";
  dialogState.mode = DialogMode.EDIT;
  await loadFormOptions();
  const data = await UserAPI.getFormData(id);
  Object.assign(formData, data);
  openDialog();
}

/**
 * 校验并提交用户表单。
 */
const handleSubmit = useDebounceFn(async () => {
  const valid = await userFormRef.value?.validate().then(
    () => true,
    () => false
  );
  if (!valid) return;

  loading.value = true;
  try {
    if (formData.id) {
      await UserAPI.update(formData.id, formData);
      ElMessage.success("修改用户成功");
    } else {
      await UserAPI.create(formData);
      ElMessage.success("新增用户成功");
    }
    closeDialog();
    handleQuery();
  } finally {
    loading.value = false;
  }
}, 300);

/**
 * 删除单个或批量用户。
 *
 * 安全检查：禁止删除当前登录用户。
 *
 * @param id 指定时删除单个用户；不指定时删除表格勾选项
 */
async function handleDelete(id?: string): Promise<void> {
  const userIds = id ?? selectedIds.value.join(",");
  if (!userIds) {
    ElMessage.warning("请勾选删除项");
    return;
  }

  // 安全检查：防止删除当前登录用户
  const currentUserId = userStore.userInfo?.userId;
  if (currentUserId) {
    const isCurrentUserInList = id
      ? id === currentUserId
      : selectedIds.value.some((selectedId) => String(selectedId) === currentUserId);
    if (isCurrentUserInList) {
      ElMessage.error("不能删除当前登录用户");
      return;
    }
  }

  try {
    await ElMessageBox.confirm("确认删除选中的用户吗？", "警告", {
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
    await UserAPI.deleteByIds(userIds);
    ElMessage.success("删除成功");
    handleQuery();
  } finally {
    loading.value = false;
  }
}

/**
 * 导出当前查询条件下的用户列表。
 */
async function handleExport(): Promise<void> {
  const response = await UserAPI.export(params);
  downloadFile(response);
  ElMessage.success("导出成功");
}

/**
 * 打开用户导入弹窗。
 */
function openImportDialog(): void {
  importDialogVisible.value = true;
}

/**
 * 重置用户密码。
 *
 * @param row 用户行数据
 */
async function handleResetPassword(row: UserItem): Promise<void> {
  try {
    const { value } = await ElMessageBox.prompt(
      `请输入用户【${row.username}】的新密码`,
      "重置密码",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputPattern: /.{6,}/,
        inputErrorMessage: "密码至少需要6位字符",
      }
    );
    await UserAPI.resetPassword(row.id, value);
    ElMessage.success("密码重置成功");
  } catch {
    // 用户取消，无需处理
  }
}

onMounted(() => {
  handleQuery();
});
</script>

<style lang="scss" scoped>
.user-page {
  display: flex;
  flex-direction: row;
  gap: 10px;
  min-height: 0;
  overflow: hidden;
  --page-aside-width: 224px;
}

.user-aside {
  position: relative;
  display: flex;
  flex: 0 0 var(--page-aside-width);
  flex-direction: column;
  width: var(--page-aside-width);
  min-width: 0;
  min-height: 0;
  overflow: visible;
  background: var(--content-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
  transition:
    flex-basis 0.2s,
    width 0.2s,
    margin-right 0.2s,
    border-color 0.2s;

  &.is-collapsed {
    flex-basis: 0;
    width: 0;
    margin-right: -10px;
    border-color: transparent;
    box-shadow: none;

    .user-aside__inner {
      pointer-events: none;
      opacity: 0;
    }

    .user-aside__toggle {
      right: -18px;
      border-left: 0;
      border-radius: 0 6px 6px 0;
    }
  }
}

.user-aside__toggle {
  position: absolute;
  top: 50%;
  right: -10px;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 48px;
  padding: 0;
  margin: 0;
  font: inherit;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  background: var(--content-bg);
  border: 1px solid var(--card-border);
  border-radius: 10px;
  box-shadow: 0 4px 12px rgb(15 23 42 / 8%);
  transform: translateY(-50%);
  transition:
    color 0.15s,
    right 0.2s;

  &:hover {
    color: var(--el-color-primary);
  }
}

.user-aside__inner {
  height: 100%;
  min-height: 0;
  overflow: hidden;
  transition: opacity 0.15s;
}

.user-aside__inner :deep(.dept-card) {
  height: 100%;
  background: transparent;
  border: 0;
  border-radius: inherit;
  box-shadow: none;

  > .el-card__body {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    padding: 12px;
  }
}

.user-aside__inner :deep(.dept-card__tree) {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
}

.user-main {
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  gap: var(--page-gap);
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.user-main :deep(.page-search) {
  .el-card__body {
    padding-top: 12px;
    padding-bottom: 12px;
  }

  .user-search__keyword {
    width: 180px;
  }
}

.user-aside__inner :deep(.dept-card__search) {
  margin-bottom: 10px;
}

.user-aside__inner :deep(.el-tree-node__content) {
  height: 32px;
}

.user-name-cell {
  display: inline-flex;
  gap: 8px;
  align-items: center;

  &__text {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    font-size: 12px;
    font-weight: 500;
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    border-radius: 50%;
  }
}
</style>
