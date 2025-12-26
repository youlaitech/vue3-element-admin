<!-- 用户管理 -->
<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!-- 部门树 -->
      <el-col :lg="4" :xs="24" class="mb-[12px]">
        <UserDeptTree v-model="queryParams.deptId" @node-click="handleQuery" />
      </el-col>

      <!-- 用户列表 -->
      <el-col :lg="20" :xs="24">
        <!-- 搜索区域 -->
        <div class="filter-section">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="auto">
            <el-form-item label="关键字" prop="keywords">
              <el-input
                v-model="queryParams.keywords"
                placeholder="用户名/昵称/手机号"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>

            <el-form-item label="状态" prop="status">
              <el-select
                v-model="queryParams.status"
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
                v-model="queryParams.createTime"
                :editable="false"
                type="daterange"
                range-separator="~"
                start-placeholder="开始时间"
                end-placeholder="截止时间"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>

            <el-form-item class="search-buttons">
              <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
              <el-button icon="refresh" @click="handleResetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <el-card shadow="hover" class="table-section">
          <div class="table-section__toolbar">
            <div class="table-section__toolbar--actions">
              <el-button
                v-hasPerm="['sys:user:create']"
                type="success"
                icon="plus"
                @click="handleOpenDialog()"
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
            </div>
            <div class="table-section__toolbar--tools">
              <el-button
                v-hasPerm="'sys:user:import'"
                icon="upload"
                @click="handleOpenImportDialog"
              >
                导入
              </el-button>

              <el-button v-hasPerm="'sys:user:export'" icon="download" @click="handleExport">
                导出
              </el-button>
            </div>
          </div>

          <el-table
            v-loading="loading"
            :data="userList"
            border
            stripe
            highlight-current-row
            class="table-section__content"
            row-key="id"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="50" align="center" />
            <el-table-column label="用户名" prop="username" />
            <el-table-column label="昵称" width="150" align="center" prop="nickname" />
            <el-table-column label="性别" width="100" align="center">
              <template #default="scope">
                <DictTag v-model="scope.row.gender" code="gender" />
              </template>
            </el-table-column>
            <el-table-column label="部门" width="120" align="center" prop="deptName" />
            <el-table-column label="手机号码" align="center" prop="mobile" width="120" />
            <el-table-column label="邮箱" align="center" prop="email" width="160" />
            <el-table-column label="状态" align="center" prop="status" width="80">
              <template #default="scope">
                <el-tag :type="scope.row.status === CommonStatus.ENABLED ? 'success' : 'info'">
                  {{ scope.row.status === CommonStatus.ENABLED ? "正常" : "禁用" }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="创建时间" align="center" prop="createTime" width="150" />
            <el-table-column label="操作" fixed="right" width="220">
              <template #default="scope">
                <el-button
                  v-hasPerm="'sys:user:reset-password'"
                  type="primary"
                  icon="RefreshLeft"
                  size="small"
                  link
                  @click="handleResetPassword(scope.row)"
                >
                  重置密码
                </el-button>
                <el-button
                  v-hasPerm="'sys:user:update'"
                  type="primary"
                  icon="edit"
                  link
                  size="small"
                  @click="handleOpenDialog(scope.row.id)"
                >
                  编辑
                </el-button>
                <el-button
                  v-hasPerm="'sys:user:delete'"
                  type="danger"
                  icon="delete"
                  link
                  size="small"
                  @click="handleDelete(scope.row.id)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <pagination
            v-if="total > 0"
            v-model:total="total"
            v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize"
            @pagination="fetchUserList"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- 用户表单 -->
    <el-drawer
      v-model="dialogState.visible"
      :title="dialogState.title"
      append-to-body
      :size="drawerSize"
      @close="handleCloseDialog"
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
          <el-button @click="handleCloseDialog">取 消</el-button>
        </div>
      </template>
    </el-drawer>

    <!-- 用户导入 -->
    <UserImportDialog v-model="importDialogVisible" @import-success="handleQuery()" />
  </div>
</template>

<script setup lang="ts">
// ==================== 1. Vue 核心 API ====================
import { computed, onMounted, reactive, ref } from "vue";
import { useDebounceFn } from "@vueuse/core";

// ==================== 2. Element Plus ====================
import { ElMessage, ElMessageBox, type FormInstance } from "element-plus";

// ==================== 3. 类型定义 ====================
import type { UserForm, UserPageQuery, UserPageVo } from "@/types/api";

// ==================== 3.5 工具函数 ====================
import { downloadFile, VALIDATORS } from "@/utils";
// ==================== 4. API 服务 ====================
import UserAPI from "@/api/system/user";
import DeptAPI from "@/api/system/dept";
import RoleAPI from "@/api/system/role";

// ==================== 5. Store ====================
import { useUserStore, useAppStore } from "@/store";

// ==================== 6. Enums ====================
import { DeviceEnum, DialogMode, CommonStatus } from "@/enums";

// ==================== 7. Composables ====================
import { useAiAction, useTableSelection } from "@/composables";

// ==================== 8. 组件 ====================
import UserDeptTree from "./components/UserDeptTree.vue";
import UserImportDialog from "./components/UserImportDialog.vue";

// ==================== 组件配置 ====================
defineOptions({
  name: "User",
  inheritAttrs: false,
});

// ==================== Store 实例 ====================
const appStore = useAppStore();
const userStore = useUserStore();

// ==================== 响应式状态 ====================

// DOM 引用
const queryFormRef = ref<FormInstance>();
const userFormRef = ref<FormInstance>();

// 列表查询参数
const queryParams = reactive<UserPageQuery>({
  pageNum: 1,
  pageSize: 10,
});

// 列表数据
const userList = ref<UserPageVo[]>([]);
const total = ref(0);
const loading = ref(false);

// 弹窗状态
const dialogState = reactive({
  visible: false,
  title: "新增用户",
  mode: DialogMode.CREATE,
});

// 初始表单数据
const initialFormData: UserForm = {
  status: CommonStatus.ENABLED,
};

// 表单数据
const formData = reactive<UserForm>({ ...initialFormData });

// 下拉选项数据
const deptOptions = ref<OptionType[]>();
const roleOptions = ref<OptionType[]>();

// 导入弹窗
const importDialogVisible = ref(false);

// ==================== 计算属性 ====================

/**
 * 抽屉尺寸（响应式）
 */
const drawerSize = computed(() => (appStore.device === DeviceEnum.DESKTOP ? "600px" : "90%"));

// ==================== 表单验证规则 ====================

const rules = reactive({
  username: [VALIDATORS.required("用户名不能为空")],
  nickname: [VALIDATORS.required("用户昵称不能为空")],
  deptId: [VALIDATORS.required("所属部门不能为空")],
  roleIds: [VALIDATORS.required("用户角色不能为空")],
  email: [VALIDATORS.email],
  mobile: [VALIDATORS.mobile],
});

// ==================== 数据加载 ====================

/**
 * 获取用户列表数据
 */
async function fetchUserList(): Promise<void> {
  loading.value = true;
  try {
    const data = await UserAPI.getPage(queryParams);
    userList.value = data.list;
    total.value = data.total;
  } catch (error) {
    ElMessage.error("获取用户列表失败");
    console.error("获取用户列表失败:", error);
  } finally {
    loading.value = false;
  }
}

// ==================== 表格选择 ====================
const { selectedIds, hasSelection, handleSelectionChange } = useTableSelection<UserPageVo>();

// ==================== 查询操作 ====================

/**
 * 查询用户列表
 */
function handleQuery(): Promise<void> {
  queryParams.pageNum = 1;
  return fetchUserList();
}

/**
 * 重置查询条件
 */
function handleResetQuery(): void {
  queryFormRef.value?.resetFields();
  queryParams.deptId = undefined;
  queryParams.createTime = undefined;
  handleQuery();
}
// ==================== 用户操作 ====================

/**
 * 重置用户密码
 * @param row 用户数据
 */
function handleResetPassword(row: UserPageVo): void {
  ElMessageBox.prompt(`请输入用户【${row.username}】的新密码`, "重置密码", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    inputPattern: /.{6,}/,
    inputErrorMessage: "密码至少需要6位字符",
  })
    .then(({ value }) => {
      return UserAPI.resetPassword(row.id, value);
    })
    .then(() => {
      ElMessage.success("密码重置成功");
    })
    .catch((error) => {
      if (error !== "cancel") {
        ElMessage.error("密码重置失败");
      }
    });
}

// ==================== 弹窗操作 ====================

/**
 * 打开用户表单弹窗
 * @param id 用户ID（编辑时传入）
 */
async function handleOpenDialog(id?: string): Promise<void> {
  dialogState.visible = true;

  // 并行加载下拉选项数据
  try {
    [roleOptions.value, deptOptions.value] = await Promise.all([
      RoleAPI.getOptions(),
      DeptAPI.getOptions(),
    ]);
  } catch (error) {
    ElMessage.error("加载选项数据失败");
    console.error("加载选项数据失败:", error);
  }

  // 编辑：加载用户数据
  if (id) {
    dialogState.title = "修改用户";
    dialogState.mode = DialogMode.EDIT;
    try {
      const data = await UserAPI.getFormData(id);
      Object.assign(formData, data);
    } catch (error) {
      ElMessage.error("加载用户数据失败");
      console.error("加载用户数据失败:", error);
    }
  } else {
    // 新增：设置默认值
    dialogState.title = "新增用户";
    dialogState.mode = DialogMode.CREATE;
  }
}

/**
 * 关闭用户表单弹窗
 */
function handleCloseDialog(): void {
  dialogState.visible = false;

  // 安全地重置表单
  userFormRef.value?.resetFields();
  userFormRef.value?.clearValidate();

  // 完全重置表单数据
  Object.assign(formData, initialFormData);
}

/**
 * 提交用户表单（防抖）
 */
const handleSubmit = useDebounceFn(async () => {
  const valid = await userFormRef.value?.validate().catch(() => false);
  if (!valid) return;

  const userId = formData.id;
  loading.value = true;

  try {
    if (userId) {
      await UserAPI.update(userId, formData);
      ElMessage.success("修改用户成功");
    } else {
      await UserAPI.create(formData);
      ElMessage.success("新增用户成功");
    }
    handleCloseDialog();
    handleResetQuery();
  } catch (error) {
    ElMessage.error(userId ? "修改用户失败" : "新增用户失败");
    console.error("提交用户表单失败:", error);
  } finally {
    loading.value = false;
  }
}, 300);

/**
 * 删除用户
 * @param id 用户ID（单个删除时传入）
 */
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
  })
    .then(async () => {
      loading.value = true;
      try {
        await UserAPI.deleteByIds(userIds);
        ElMessage.success("删除成功");
        handleResetQuery();
      } catch (error) {
        ElMessage.error("删除失败");
        console.error("删除用户失败:", error);
      } finally {
        loading.value = false;
      }
    })
    .catch(() => {
      // 用户取消操作，无需处理
    });
}

// ==================== 导入导出 ====================

/**
 * 打开导入弹窗
 */
function handleOpenImportDialog(): void {
  importDialogVisible.value = true;
}

/**
 * 导出用户列表
 */
async function handleExport(): Promise<void> {
  try {
    const response = await UserAPI.export(queryParams);
    downloadFile(response);
    ElMessage.success("导出成功");
  } catch (error) {
    ElMessage.error("导出失败");
    console.error("导出用户列表失败:", error);
  }
}

// ==================== AI 助手相关 ====================
useAiAction({
  actionHandlers: {
    /**
     * AI 修改用户昵称
     * 使用配置对象方式：自动处理确认、执行、反馈
     */
    updateUserNickname: {
      needConfirm: true,
      callBackendApi: true,
      confirmMessage: (args: any) =>
        `AI 助手将执行以下操作：<br/>
        <strong>修改用户：</strong> ${args.username}<br/>
        <strong>新昵称：</strong> ${args.nickname}<br/><br/>
        确认执行吗？`,
      successMessage: (args: any) => `已将用户 ${args.username} 的昵称修改为 ${args.nickname}`,
      execute: async () => {
        // callBackendApi=true 时，execute 可以为空
        // Composable 会自动调用后端 API
      },
    },

    /**
     * AI 查询用户
     * 使用配置对象方式：查询操作不需要确认
     */
    queryUser: {
      needConfirm: false, // 查询操作无需确认
      successMessage: (args: any) => `已搜索：${args.keywords}`,
      execute: async (args: any) => {
        queryParams.keywords = args.keywords;
        await handleQuery();
      },
    },
  },
  onRefresh: fetchUserList,
  onAutoSearch: (keywords: string) => {
    queryParams.keywords = keywords;
    setTimeout(() => {
      handleQuery();
      ElMessage.success(`AI 助手已为您自动搜索：${keywords}`);
    }, 300);
  },
});

// ==================== 生命周期 ====================

/**
 * 组件挂载时初始化数据
 */
onMounted(() => {
  handleQuery();
});
</script>

<style scoped lang="scss"></style>
