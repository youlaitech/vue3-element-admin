<!-- 用户管理 -->
<template>
  <div class="page-container user-page">
    <div class="user-page__shell">
      <aside class="user-page__aside" :class="{ 'is-collapsed': sidebarCollapsed }">
        <div class="user-page__aside-inner">
          <UserDeptTree v-model="tableData.params.deptId" @node-click="handleQuery" />
        </div>
        <button class="user-page__aside-toggle" @click="sidebarCollapsed = !sidebarCollapsed">
          <el-icon :size="14">
            <ArrowLeft v-if="!sidebarCollapsed" />
            <ArrowRight v-else />
          </el-icon>
        </button>
      </aside>

      <main class="page-main">
        <el-card class="page-search" shadow="never">
          <el-form ref="queryFormRef" :model="tableData.params" :inline="true" label-width="auto">
            <el-form-item label="关键字" prop="keywords">
              <el-input
                v-model="tableData.params.keywords"
                placeholder="用户名/昵称/手机号"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>

            <el-form-item label="状态" prop="status">
              <el-select
                v-model="tableData.params.status"
                placeholder="全部"
                clearable
                style="width: 100px"
              >
                <el-option label="正常" :value="1" />
                <el-option label="禁用" :value="0" />
              </el-select>
            </el-form-item>

            <el-form-item label="创建时间">
              <el-date-picker
                v-model="tableData.params.createTime"
                :editable="false"
                type="daterange"
                range-separator="~"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
                style="width: 220px"
              />
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
                  <span v-else class="user-name-cell__text">{{ getAvatarText(scope.row) }}</span>
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
                  v-if="scope.row.gender === 1 || scope.row.gender === 2"
                  :type="scope.row.gender === 1 ? 'primary' : 'danger'"
                  size="small"
                >
                  <el-icon>
                    <Male v-if="scope.row.gender === 1" />
                    <Female v-else />
                  </el-icon>
                  <span>{{ scope.row.gender === 1 ? "男" : "女" }}</span>
                </el-tag>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column label="部门" min-width="140" prop="deptName" show-overflow-tooltip />
            <el-table-column label="角色" prop="roleNames" min-width="160" show-overflow-tooltip />
            <el-table-column label="手机号码" prop="mobile" width="130" />
            <el-table-column label="邮箱" prop="email" min-width="180" show-overflow-tooltip />
            <el-table-column label="创建时间" prop="createTime" width="160" show-overflow-tooltip />
            <el-table-column label="操作" fixed="right" align="center" width="140">
              <template #default="scope">
                <div class="table-op">
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
                    @command="(command: string) => handleTableCommand(command, scope.row)"
                  >
                    <el-button type="primary" link>
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
import { MoreFilled, Male, Female, ArrowLeft, ArrowRight } from "@element-plus/icons-vue";

import type { UserForm, UserItem } from "@/api/system/user";
import type { OptionItem } from "@/api/common";
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
const sidebarCollapsed = ref(false);

const tableData = reactive<{
  list: UserItem[];
  total: number;
  params: Record<string, any>;
}>({
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
    const data = await UserAPI.getPage(tableData.params as any);
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

function handleTableCommand(command: string, row: UserItem): void {
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
  const response = await UserAPI.export(tableData.params as any);
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
  height: calc(100vh - 50px - 40px);
  padding: 0;
}

.user-page__shell {
  display: flex;
  height: 100%;
}

.user-page__aside {
  position: relative;
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  width: 220px;
  height: 100%;
  background: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color-light);
  transition: width 0.25s;

  &.is-collapsed {
    width: 40px;

    .user-page__aside-inner {
      pointer-events: none;
      opacity: 0;
    }
  }
}

.user-page__aside-inner {
  flex: 1;
  min-height: 0;
  padding: 14px;
  overflow-y: auto;
  transition: opacity 0.15s;
}

.user-page__aside-toggle {
  position: absolute;
  top: 50%;
  right: 0;
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
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-right: none;
  border-radius: 6px 0 0 6px;
  transform: translateY(-50%);
  transition: color 0.15s;

  &:hover {
    color: var(--el-color-primary);
  }
}

.page-main {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  height: 100%;
  overflow-y: auto;

  > .el-card {
    border-right: none;
    border-left: none;
    border-radius: 0;
  }

  .page-search {
    flex-shrink: 0;
    border-top: none;
  }

  .page-content {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    border-bottom: none;

    :deep(.el-card__body) {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
  }
}

.page-toolbar {
  flex-shrink: 0;
}

.user-table {
  flex: 1;
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

.table-op {
  display: inline-flex;
  gap: 4px;
  align-items: center;
}
</style>
