<script lang="ts">
export default {
  name: 'role'
};
</script>

<script setup lang="ts">
import { nextTick, onMounted, reactive, ref, toRefs } from 'vue';
import {
  listRolePages,
  updateRole,
  getRoleFormDetail,
  addRole,
  deleteRoles,
  getRoleResources,
  updateRoleResource
} from '@/api/system/role';
import { listResources } from '@/api/system/menu';

import { ElForm, ElMessage, ElMessageBox, ElTree } from 'element-plus';
import { Search, Plus, Edit, Refresh, Delete } from '@element-plus/icons-vue';
import {
  RoleFormData,
  RoleItem,
  RoleQueryParam
} from '@/types/api/system/role';
import { Resource } from '@/types/api/system/menu';
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
    pageSize: 10
  } as RoleQueryParam,
  roleList: [] as RoleItem[],
  total: 0,
  dialog: {
    title: '',
    visible: false
  },
  formData: {} as RoleFormData,
  rules: {
    name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
    code: [{ required: true, message: '请输入角色编码', trigger: 'blur' }]
  },
  resourceDialogVisible: false,
  resourceOptions: [] as Resource[],
  btnPerms: {} as any,
  // 勾选的菜单ID
  checkedMenuIds: new Set([]),
  allPermIds: [] as string[],
  // 选中的角色
  checkedRole: {
    id: '',
    name: ''
  }
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
  checkedRole,
  resourceOptions,
  btnPerms
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
/**
 * 查询重置
 */
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
    visible: true
  };
}

function handleUpdate(row: any) {
  state.dialog = {
    title: '修改角色',
    visible: true
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
  dialog.value.visible = false;
  formData.value.id = undefined;
  dataFormRef.value.resetFields();
  dataFormRef.value.clearValidate();
}

/**
 *  删除
 */
function handleDelete(row: any) {
  const ids = [row.id || state.ids].join(',');
  ElMessageBox.confirm('确认删除已选中的数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      deleteRoles(ids).then(() => {
        ElMessage.success('删除成功');
        handleQuery();
      });
    })
    .catch(() => ElMessage.info('已取消删除'));
}

const handleResourceCheckChange = (
  data: Resource,
  isCheck: boolean,
  sonHasCheck: boolean
) => {
  console.log('data', data);
  console.log('isCheck', isCheck);
  if (data.perms) {
    data.perms.forEach(item => {
      btnPerms.value[item.value] = isCheck;
    });
  }
};

/**
 * 分配资源(菜单+权限)弹窗
 */
function openRoleResourceDialog(row: RoleItem) {
  resourceDialogVisible.value = true;
  loading.value = true;

  const roleId: any = row.id;
  checkedRole.value = {
    id: roleId,
    name: row.name
  };

  // 获取所有的资源
  listResources().then(response => {
    resourceOptions.value = response.data;

    // 获取角色拥有的资源
    getRoleResources(roleId).then(({ data }) => {
      // 勾选的菜单回显
      const checkedMenuIds = data.menuIds;
      resourceRef.value.setCheckedKeys(checkedMenuIds);

      nextTick(() => {
        // 勾选的权限回显
        const rolePermIds = data.permIds;

        state.allPermIds = filterResourcePermIds(response.data, []);
        if (state.allPermIds) {
          state.allPermIds.forEach(permId => {
            if (rolePermIds.indexOf(permId) > -1) {
              btnPerms.value[permId] = true;
            } else {
              btnPerms.value[permId] = false;
            }
          });
        }
        loading.value = false;
      });
    });
  });
}

const filterResourcePermIds = (resources: Resource[], permIds: string[]) => {
  resources.forEach(resource => {
    if (resource.perms) {
      resource.perms.forEach(perm => {
        permIds.push(perm.value);
      });
    }
    if (resource.children) {
      filterResourcePermIds(resource.children, permIds);
    }
  });
  return permIds;
};
/**
 * 分配资源提交
 */
function handleRoleResourceSubmit() {
  const checkedMenuIds: any[] = resourceRef.value
    .getCheckedNodes(false, true)
    .map((node: any) => node.value);

  const checkedPermIds = [] as string[];
  if (state.allPermIds) {
    state.allPermIds.forEach(permId => {
      if (btnPerms.value[permId]) {
        checkedPermIds.push(permId);
      }
    });
  }

  const RoleResource = {
    menuIds: checkedMenuIds,
    permIds: checkedPermIds
  };

  updateRoleResource(checkedRole.value.id, RoleResource).then(res => {
    ElMessage.success('分配权限成功');
    state.resourceDialogVisible = false;
    handleQuery();
  });
}

/**
 * 取消资源分配
 */
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
          <el-tooltip content="分配资源" effect="light">
            <el-button
              type="success"
              circle
              plain
              @click.stop="openRoleResourceDialog(scope.row)"
            >
              <svg-icon icon-class="perm" />
            </el-button>
          </el-tooltip>

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

    <!--分配资源弹窗-->
    <el-dialog
      :title="'角色【' + checkedRole.name + '】资源分配'"
      v-model="resourceDialogVisible"
      width="800px"
    >
      <el-scrollbar max-height="600px" v-loading="loading">
        <el-tree
          ref="resourceRef"
          node-key="value"
          show-checkbox
          :data="resourceOptions"
          :default-expand-all="true"
          @check-change="handleResourceCheckChange"
        >
          <template #default="{ data }">
            {{ data.label }}

            <div v-if="data.perms" class="resource-tree-node">
              <el-divider direction="vertical" />
              <div class="node-content">
                <el-checkbox
                  v-for="perm in data.perms"
                  :key="perm.value"
                  :label="perm.value"
                  border
                  size="small"
                  v-model="btnPerms[perm.value]"
                  >{{ perm.label }}</el-checkbox
                >
              </div>
            </div>
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
  font-size: 14px;
  justify-content: flex-end;
  margin: 0 50px;
  .node-content {
    width: 400px;
    display: flex;
    flex-wrap: wrap;
  }
  .el-divider--vertical {
    height: 2em !important;
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
