<script lang="ts">
export default {
  name: 'role',
};
</script>

<script setup lang="ts">
import { onMounted, reactive, ref, toRefs, nextTick } from 'vue';
import {
  listRolePages,
  updateRole,
  getRoleFormDetail,
  addRole,
  deleteRoles,
  getRoleResourceIds,
  updateRoleResource,
} from '@/api/system/role';
import { getResource } from '@/api/system/menu';

import { ElForm, ElMessage, ElMessageBox, ElTree } from 'element-plus';
import { Search, Plus, Edit, Refresh, Delete } from '@element-plus/icons-vue';
import {
  RoleFormData,
  RoleItem,
  RoleQueryParam,
} from '@/types/api/system/role';
import SvgIcon from '@/components/SvgIcon/index.vue';

const emit = defineEmits(['roleClick']);
const queryFormRef = ref(ElForm);
const dataFormRef = ref(ElForm);
const resourceRef = ref(ElTree);

const state = reactive({
  loading: true,
  // 选中ID数组
  ids: [],
  // 非单个禁用
  single: true,
  // 非多个禁用
  multiple: true,
  queryParams: {
    pageNum: 1,
    pageSize: 10,
  } as RoleQueryParam,
  roleList: [] as RoleItem[],
  total: 0,
  dialog: {
    title: '',
    visible: false,
  },
  formData: {} as RoleFormData,
  rules: {
    name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
    code: [{ required: true, message: '请输入角色编码', trigger: 'blur' }],
  },
  resourceDialogVisible: false,
  menuOptions: [] as any[],
  permOptions: [] as any[],
  checkedRole: {
    id: '',
    name: '',
  }, // 选中的角色
});

const {
  loading,
  multiple,
  queryParams,
  roleList,
  total,
  dialog,
  formData,
  rules,
  resourceDialogVisible,
  menuOptions,
  permOptions,
  checkedRole,
} = toRefs(state);

function handleQuery() {
  emit('roleClick', {});
  state.loading = true;
  listRolePages(state.queryParams).then(({ data }) => {
    state.roleList = data.list;
    state.total = data.total;
    state.loading = false;
  });
}

function resetQuery() {
  queryFormRef.value.resetFields();
  handleQuery();
}

function handleSelectionChange(selection: any) {
  state.ids = selection.map((item: any) => item.id);
  state.single = selection.length !== 1;
  state.multiple = !selection.length;
}

function handleRowClick(row: any) {
  emit('roleClick', row);
}

function handleAdd() {
  state.dialog = {
    title: '添加角色',
    visible: true,
  };
}

function handleUpdate(row: any) {
  state.dialog = {
    title: '修改角色',
    visible: true,
  };
  const roleId = row.id || state.ids;
  getRoleFormDetail(roleId).then(({ data }) => {
    state.formData = data;
  });
}

function submitFormData() {
  loading.value = true;
  dataFormRef.value.validate((valid: any) => {
    if (valid) {
      if (state.formData.id) {
        updateRole(state.formData.id as any, state.formData).then(() => {
          ElMessage.success('修改角色成功');
          cancel();
          handleQuery();
          loading.value = false;
        });
      } else {
        addRole(state.formData).then(() => {
          cancel();
          ElMessage.success('新增角色成功');
          handleQuery();
          loading.value = false;
        });
      }
    }
  });
}

/**
 * 取消
 */
function cancel() {
  state.dialog.visible = false;
  dataFormRef.value.resetFields();
}

/**
 *  删除
 */
function handleDelete(row: any) {
  const ids = [row.id || state.ids].join(',');
  ElMessageBox.confirm('确认删除已选中的数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      deleteRoles(ids).then(() => {
        ElMessage.success('删除成功');
        handleQuery();
      });
    })
    .catch(() => ElMessage.info('已取消删除'));
}

/**
 * 分配资源权限
 */
function handleResourceAssign(row: RoleItem) {
  resourceDialogVisible.value = true;
  loading.value = true;
  permOptions.value.map((item) => (item.checked = false));

  const roleId: any = row.id;
  checkedRole.value = {
    id: roleId,
    name: row.name,
  };

  //资源下拉数据
  getResource().then((response) => {
    state.menuOptions = response.data.menus;
    state.permOptions = response.data.perms;

    // 获取角色拥有的资源数据进行勾选
    getRoleResourceIds(roleId).then((res) => {
      const checkedMenuIds = res.data.menuIds;
      const checkedPermIds = res.data.permIds;
      resourceRef.value.setCheckedKeys(checkedMenuIds);

      permOptions.value.forEach((perm) => {
        if (checkedPermIds.includes(perm.value)) {
          perm.checked = true;
        } else {
          perm.checked = false;
        }
      });
      loading.value = false;
    });
  });
}

/**
 * 分配资源权限提交
 */
function handleRoleResourceSubmit() {
  const checkedMenuIds: any[] = resourceRef.value
    .getCheckedNodes(false, true)
    .map((node: any) => node.value);

  const checkedPermIds = state.permOptions
    .filter((item) => item.checked)
    .map((item) => item.value);

  const roleResourceData = {
    menuIds: checkedMenuIds,
    permIds: checkedPermIds,
  };

  updateRoleResource(checkedRole.value.id, roleResourceData).then((res) => {
    ElMessage.success('分配权限成功');
    state.resourceDialogVisible = false;
    handleQuery();
  });
}

// 取消资源分配
function cancelResourceAssign() {
  state.resourceDialogVisible = false;
}

onMounted(() => {
  handleQuery();
});
</script>

<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form ref="queryFormRef" :model="queryParams" :inline="true">
      <el-form-item>
        <el-button type="success" :icon="Plus" @click="handleAdd"
          >新增</el-button
        >
        <el-button
          type="danger"
          :icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          >删除</el-button
        >
      </el-form-item>

      <el-form-item prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="角色名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :icon="Search" @click="handleQuery"
          >搜索</el-button
        >
        <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 数据表格 -->
    <el-table
      ref="dataTableRef"
      v-loading="loading"
      :data="roleList"
      @selection-change="handleSelectionChange"
      @row-click="handleRowClick"
      highlight-current-row
      border
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="角色名称" prop="name" />
      <el-table-column label="角色编码" prop="code" />
      <el-table-column label="操作" align="center" width="200">
        <template #default="scope">
          <el-button
            type="primary"
            circle
            plain
            @click.stop="handleResourceAssign(scope.row)"
          >
            <svg-icon icon-class="perm" />
          </el-button>

          <el-button
            type="primary"
            :icon="Edit"
            circle
            plain
            @click.stop="handleUpdate(scope.row)"
          />
          <el-button
            type="danger"
            :icon="Delete"
            circle
            plain
            @click.stop="handleDelete(scope.row)"
          />
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页工具条 -->
    <pagination
      v-if="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="handleQuery"
    />

    <!-- 表单弹窗 -->
    <el-dialog
      :title="dialog.title"
      v-model="dialog.visible"
      width="500px"
      destroy-on-close
    >
      <el-form
        ref="dataFormRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入角色名称" />
        </el-form-item>

        <el-form-item label="角色编码" prop="code">
          <el-input v-model="formData.code" placeholder="请输入角色编码" />
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input-number
            v-model="formData.sort"
            controls-position="right"
            :min="0"
            style="width: 100px"
          />
        </el-form-item>

        <el-form-item label="状态">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitFormData">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!--分配权限弹窗-->
    <el-dialog
      :title="'【' + checkedRole.name + '】分配权限'"
      v-model="resourceDialogVisible"
      width="1000px"
    >
      <el-scrollbar max-height="600px" v-loading="loading">
        <el-tree
          ref="resourceRef"
          node-key="value"
          show-checkbox
          :data="menuOptions"
          :default-expand-all="true"
        >
          <template #default="{ node, data }">
            <div v-if="data.isPerm == true" class="resource-tree-node">
              <div class="resource-tree-node__content">
                <el-checkbox
                  v-for="perm in permOptions.filter(
                    (perm) => perm.parentId == data.permPid
                  )"
                  :key="perm.value"
                  :label="perm.value"
                  v-model="perm.checked"
                  border
                  size="small"
                  >{{ perm.label }}</el-checkbox
                >
              </div>
            </div>
            <span v-else>{{ node.label }}</span>
          </template>
        </el-tree>
      </el-scrollbar>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleRoleResourceSubmit"
            >确 定</el-button
          >
          <el-button @click="cancelResourceAssign">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss">
.resource-tree-node {
  width: 100%;
  flex-wrap: wrap;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
  margin-left: -28px !important;

  &__content {
    display: flex;
    flex-wrap: wrap;
  }
  .el-checkbox--default {
    background-color: transparent !important;
  }
}
.el-tree-node__content {
  height: auto !important;
}

.el-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  &:hover {
    background-color: var(--el-tree-node-hover-bg-color);
  }
  &:active {
    background-color: var(--el-tree-node-hover-bg-color);
  }
}

.el-checkbox.el-checkbox--small {
  margin: 5px;
  z-index: 999;
  background: #fff;
}
</style>
