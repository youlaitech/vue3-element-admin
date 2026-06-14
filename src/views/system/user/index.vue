<!-- 用户管理 -->
<template>
  <div class="page-container user-page">
    <div class="user-page__shell">
      <aside class="user-page__aside">
        <UserDeptTree v-model="tableData.params.deptId" @node-click="handleQuery" />
      </aside>

      <main class="page-main">
        <el-card class="page-search" shadow="never">
          <el-form
            ref="queryFormRef"
            class="user-query-form"
            :model="tableData.params"
            :inline="true"
            label-width="auto"
          >
            <el-form-item
              class="user-query-form__item user-query-form__item--keyword"
              label="关键字"
              prop="keywords"
            >
              <el-input
                v-model="tableData.params.keywords"
                placeholder="用户名 / 昵称 / 手机号"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>

            <el-form-item
              class="user-query-form__item user-query-form__item--status"
              label="状态"
              prop="status"
            >
              <el-select v-model="tableData.params.status" placeholder="全部" clearable>
                <el-option label="正常" :value="1" />
                <el-option label="禁用" :value="0" />
              </el-select>
            </el-form-item>

            <el-form-item
              class="user-query-form__item user-query-form__item--date"
              label="创建时间"
            >
              <el-date-picker
                v-model="tableData.params.createTime"
                :editable="false"
                type="daterange"
                range-separator="~"
                start-placeholder="开始时间"
                end-placeholder="截止时间"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>

            <el-form-item class="user-query-form__actions">
              <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
              <el-button icon="refresh" @click="handleResetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card class="page-content" shadow="never">
          <div class="page-toolbar">
            <div class="page-toolbar__left">
              <el-button
                v-hasPerm="['sys:user:create']"
                type="primary"
                icon="plus"
                @click="handleCreateClick"
              >
                新增
              </el-button>
              <el-button
                v-hasPerm="'sys:user:delete'"
                type="danger"
                icon="delete"
                :disabled="!hasSelection"
                @click="handleDelete()"
              >
                删除
              </el-button>
              <el-button v-hasPerm="'sys:user:import'" icon="upload" @click="openImportDialog">
                导入
              </el-button>
              <el-button v-hasPerm="'sys:user:export'" icon="download" @click="handleExport">
                导出
              </el-button>
            </div>
          </div>

          <el-table
            v-loading="loading"
            class="user-table"
            :data="tableData.list"
            highlight-current-row
            row-key="id"
            :scrollbar-always-on="true"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="48" fixed="left" align="center" />
            <el-table-column label="用户" width="220" fixed="left">
              <template #default="scope">
                <div class="user-profile-cell">
                  <span class="user-profile-cell__avatar">
                    {{ getAvatarText(scope.row) }}
                  </span>
                  <span class="user-profile-cell__meta">
                    <strong>{{ scope.row.nickname || "-" }}</strong>
                    <span>{{ scope.row.username }}</span>
                  </span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="状态" align="center" prop="status" width="120">
              <template #default="scope">
                <span
                  :class="[
                    'status-pill',
                    scope.row.status === CommonStatus.ENABLED ? 'is-enabled' : 'is-disabled',
                  ]"
                >
                  {{ scope.row.status === CommonStatus.ENABLED ? "正常" : "禁用" }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="性别" width="100" align="center">
              <template #default="scope">
                <DictTag v-model="scope.row.gender" code="gender" />
              </template>
            </el-table-column>
            <el-table-column label="部门" min-width="180" prop="deptName" show-overflow-tooltip />
            <el-table-column label="角色" prop="roleNames" min-width="180" show-overflow-tooltip />
            <el-table-column label="手机号码" prop="mobile" width="150" />
            <el-table-column label="邮箱" prop="email" min-width="220" show-overflow-tooltip />
            <el-table-column label="创建时间" prop="createTime" width="180" show-overflow-tooltip />
            <el-table-column label="操作" fixed="right" align="center" width="150">
              <template #default="scope">
                <div class="table-actions">
                  <el-button
                    v-hasPerm="'sys:user:update'"
                    type="primary"
                    link
                    @click="handleEditClick(scope.row.id)"
                  >
                    编辑
                  </el-button>
                  <el-button
                    v-hasPerm="'sys:user:delete'"
                    type="danger"
                    link
                    @click="handleDelete(scope.row.id)"
                  >
                    删除
                  </el-button>
                  <el-dropdown
                    v-hasPerm="'sys:user:reset-password'"
                    trigger="click"
                    @command="(command) => handleTableCommand(command, scope.row)"
                  >
                    <el-button class="table-actions__more" type="primary" link>
                      <el-icon><MoreFilled /></el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="resetPassword">重置密码</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <pagination
            v-if="tableData.total > 0"
            v-model:total="tableData.total"
            v-model:page="tableData.params.pageNum"
            v-model:limit="tableData.params.pageSize"
            @pagination="fetchList"
          />
        </el-card>
      </main>
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
import { computed, onMounted, reactive, ref } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus";
import { MoreFilled } from "@element-plus/icons-vue";
import type { UserForm, UserItem } from "@/api/system/user";
import { downloadFile } from "@/utils";
import UserAPI from "@/api/system/user";
import DeptAPI from "@/api/system/dept";
import RoleAPI from "@/api/system/role";
import { useUserStore, useAppStore } from "@/stores";
import { DeviceEnum, DialogMode, CommonStatus } from "@/enums";
import { useTableSelection } from "@/composables";
import UserDeptTree from "./components/UserDeptTree.vue";
import UserImportDialog from "./components/UserImportDialog.vue";

defineOptions({
  name: "User",
  inheritAttrs: false,
});

const appStore = useAppStore();
const userStore = useUserStore();

const queryFormRef = ref<FormInstance>();
const userFormRef = ref<FormInstance>();

const loading = ref(false);

const tableData = reactive<PageResult<UserItem>>({
  list: [],
  total: 0,
  params: {
    pageNum: 1,
    pageSize: 10,
  },
});

const dialogState = reactive({
  visible: false,
  title: "新增用户",
  mode: DialogMode.CREATE,
});

const importDialogVisible = ref(false);

const initialFormData: UserForm = {
  status: CommonStatus.ENABLED,
};

const formData = reactive<UserForm>({ ...initialFormData });

const deptOptions = ref<OptionItem[]>();
const roleOptions = ref<OptionItem[]>();

const drawerSize = computed(() => (appStore.device === DeviceEnum.DESKTOP ? "600px" : "90%"));

function getAvatarText(row: UserItem): string {
  const text = row.nickname || row.username || "?";
  return text.slice(0, 1).toUpperCase();
}

const rules: FormRules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  nickname: [{ required: true, message: "请输入用户昵称", trigger: "blur" }],
  deptId: [{ required: true, message: "请选择所属部门", trigger: "change" }],
  roleIds: [{ required: true, message: "请选择用户角色", trigger: "change" }],
  email: [{ type: "email", message: "请输入正确的邮箱地址", trigger: "blur" }],
  mobile: [{ pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号码", trigger: "blur" }],
};

async function fetchList(): Promise<void> {
  loading.value = true;
  try {
    const data = await UserAPI.getPage(tableData.params);
    tableData.list = data.list ?? [];
    tableData.total = data.total ?? 0;
  } finally {
    loading.value = false;
  }
}

async function loadFormOptions(): Promise<void> {
  [roleOptions.value, deptOptions.value] = await Promise.all([
    RoleAPI.getOptions(),
    DeptAPI.getOptions(),
  ]);
}

const { selectedIds, hasSelection, handleSelectionChange } = useTableSelection<UserItem>();

function handleQuery(): void {
  tableData.params.pageNum = 1;
  fetchList();
}

function handleResetQuery(): void {
  queryFormRef.value?.resetFields();
  tableData.params.deptId = undefined;
  tableData.params.createTime = undefined;
  handleQuery();
}

async function resetPassword(userId: string, password: string): Promise<void> {
  await UserAPI.resetPassword(userId, password);
  ElMessage.success("密码重置成功");
}

async function deleteUsers(userIds: string): Promise<void> {
  await UserAPI.deleteByIds(userIds);
  ElMessage.success("删除成功");
  handleQuery();
}

function openDialog(): void {
  dialogState.visible = true;
}

function closeDialog(): void {
  dialogState.visible = false;
  resetForm();
}

function resetForm(): void {
  userFormRef.value?.resetFields();
  userFormRef.value?.clearValidate();
  Object.assign(formData, initialFormData);
}

function handleResetPassword(row: UserItem): void {
  ElMessageBox.prompt(`请输入用户【${row.username}】的新密码`, "重置密码", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    inputPattern: /.{6,}/,
    inputErrorMessage: "密码至少需要6位字符",
  }).then(
    (result: { value: string }) => resetPassword(row.id, result.value),
    () => {
      /* 用户取消 */
    }
  );
}

function handleTableCommand(command: unknown, row: UserItem): void {
  if (command === "resetPassword") {
    handleResetPassword(row);
  }
}

async function handleCreateClick(): Promise<void> {
  dialogState.title = "新增用户";
  dialogState.mode = DialogMode.CREATE;
  await loadFormOptions();
  openDialog();
}

async function handleEditClick(id: string): Promise<void> {
  dialogState.title = "修改用户";
  dialogState.mode = DialogMode.EDIT;
  await loadFormOptions();
  const data = await UserAPI.getFormData(id);
  Object.assign(formData, data);
  openDialog();
}

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

function handleDelete(id?: string): void {
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

  ElMessageBox.confirm("确认删除选中的用户吗？", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    () => deleteUsers(userIds),
    () => {
      /* 用户取消 */
    }
  );
}

async function handleExport(): Promise<void> {
  const response = await UserAPI.export(tableData.params);
  downloadFile(response);
  ElMessage.success("导出成功");
}

function openImportDialog(): void {
  importDialogVisible.value = true;
}

onMounted(() => {
  handleQuery();
});
</script>

<style lang="scss" scoped>
.user-page {
  min-width: 0;
  height: 100%;
}

.user-page__shell {
  display: grid;
  grid-template-columns: 232px minmax(0, 1fr);
  gap: 12px;
  align-items: start;
}

.user-page__aside {
  min-width: 0;

  :deep(.el-card) {
    min-height: calc(100vh - 154px);
    border-color: transparent;
    box-shadow: none;
  }

  :deep(.el-card__body) {
    height: 100%;
    padding: 14px;
  }
}

.user-query-form {
  display: flex;
  flex-wrap: nowrap;
  gap: 10px;
  align-items: center;
  min-width: 0;
  overflow-x: auto;
}

.user-query-form__item {
  flex: 0 0 auto;
}

.user-query-form__item--keyword {
  width: 220px;
}

.user-query-form__item--status {
  width: 132px;
}

.user-query-form__item--date {
  width: 304px;
}

.user-query-form__actions {
  margin-left: 0;

  :deep(.el-form-item__content) {
    display: flex;
    flex-wrap: nowrap;
    gap: 8px;
  }

  :deep(.el-button) {
    margin-left: 0 !important;
    white-space: nowrap;
  }
}

.user-table {
  width: 100%;

  :deep(.el-table__body tr:hover .user-profile-cell__avatar) {
    transform: scale(1.04);
  }
}

.user-profile-cell {
  display: inline-flex;
  gap: 10px;
  align-items: center;
  min-width: 0;
}

.user-profile-cell__avatar {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  font-size: 13px;
  font-weight: 500;
  color: var(--el-color-primary);
  background: color-mix(in srgb, var(--el-color-primary) 8%, var(--el-bg-color) 92%);
  border: 1px solid color-mix(in srgb, var(--el-color-primary) 20%, var(--el-bg-color) 80%);
  border-radius: 50%;
  box-shadow: 0 1px 2px rgb(22 93 255 / 16%);
  transition: transform 0.16s;
}

.user-profile-cell__meta {
  display: grid;
  min-width: 0;

  strong,
  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  span {
    margin-top: 2px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}

.status-pill {
  display: inline-flex;
  gap: 5px;
  align-items: center;
  height: 24px;
  padding: 0 8px;
  font-size: 12px;
  font-weight: 400;
  border-radius: 999px;

  &::before {
    width: 6px;
    height: 6px;
    content: "";
    border-radius: 50%;
  }

  &.is-enabled {
    color: var(--el-color-success);
    background: var(--el-color-success-light-9);

    &::before {
      background: var(--el-color-success);
    }
  }

  &.is-disabled {
    color: var(--el-color-warning);
    background: var(--el-color-warning-light-9);

    &::before {
      background: var(--el-color-warning);
    }
  }
}

.table-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
}

.table-actions__more {
  font-size: 16px;
}

@media (max-width: 1280px) {
  .user-page__shell {
    grid-template-columns: 1fr;
  }

  .user-page__aside {
    :deep(.el-card) {
      min-height: auto;
    }
  }

  .user-query-form__actions {
    margin-left: 0;
  }
}

@media (max-width: 960px) {
  .user-query-form {
    flex-wrap: wrap;
  }

  .user-query-form__item--keyword,
  .user-query-form__item--status,
  .user-query-form__item--date {
    width: calc(50% - 6px);
  }
}

@media (max-width: 768px) {
  .user-query-form {
    align-items: stretch;
  }

  .user-query-form :deep(.el-form-item) {
    width: 100%;
  }

  .user-query-form__item--keyword,
  .user-query-form__item--status,
  .user-query-form__item--date {
    width: 100%;
  }
}
</style>
