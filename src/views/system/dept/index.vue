<script lang="ts">
export default {
  name: 'dept'
};
</script>

<script setup lang="ts">
import { onMounted, reactive, ref, toRefs } from 'vue';

import {
  getDeptForm,
  deleteDept,
  updateDept,
  addDept,
  listDeptOptions,
  listDepartments
} from '@/api/dept';

import { Search, Plus, Refresh, Delete } from '@element-plus/icons-vue';
import { ElForm, ElMessage, ElMessageBox } from 'element-plus';
import { Dept, DeptForm, DeptQuery } from '@/api/dept/types';

const queryFormRef = ref(ElForm);
const dataFormRef = ref(ElForm);

const state = reactive({
  loading: false,
  // 选中ID数组
  ids: [] as number[],
  // 表格树数据
  dataList: [] as Dept[],
  deptOptions: [] as OptionType[],
  dialog: { visible: false } as DialogType,
  queryParams: {} as DeptQuery,
  formData: {
    sort: 1,
    status: 1
  } as DeptForm,
  rules: {
    parentId: [
      { required: true, message: '上级部门不能为空', trigger: 'blur' }
    ],
    name: [{ required: true, message: '部门名称不能为空', trigger: 'blur' }],
    sort: [{ required: true, message: '显示排序不能为空', trigger: 'blur' }]
  }
});

const {
  ids,
  loading,
  dataList,
  deptOptions,
  queryParams,
  formData,
  rules,
  dialog
} = toRefs(state);

/**
 * 查询
 */
function handleQuery() {
  loading.value = true;
  listDepartments(state.queryParams).then(({ data }) => {
    dataList.value = data;
    loading.value = false;
  });
}

/**
 * 重置
 */
function resetQuery() {
  queryFormRef.value.resetFields();
  handleQuery();
}

function handleSelectionChange(selection: any) {
  state.ids = selection.map((item: any) => item.id);
}

/**
 * 获取部门下拉数据
 */
async function getDeptOptions() {
  const deptOptions: any[] = [];
  listDeptOptions().then(response => {
    const rootDeptOption = {
      value: '0',
      label: '顶级部门',
      children: response.data
    };
    deptOptions.push(rootDeptOption);
    state.deptOptions = deptOptions;
  });
}

/**
 * 添加
 */
function handleAdd(row: any) {
  getDeptOptions();
  formData.value.id = undefined;
  formData.value.parentId = row.id;
  dialog.value = {
    title: '添加部门',
    visible: true
  };
}

/**
 * 修改
 */
async function handleUpdate(row: any) {
  await getDeptOptions();
  const deptId = row.id || state.ids;
  state.dialog = {
    title: '修改部门',
    visible: true
  };
  getDeptForm(deptId).then((response: any) => {
    state.formData = response.data;
  });
}

/**
 * 提交
 */
function submitForm() {
  dataFormRef.value.validate((valid: any) => {
    if (valid) {
      if (state.formData.id) {
        updateDept(state.formData.id, state.formData).then(() => {
          ElMessage.success('修改成功');
          closeDialog();
          handleQuery();
        });
      } else {
        addDept(state.formData).then(() => {
          ElMessage.success('新增成功');
          closeDialog();
          handleQuery();
        });
      }
    }
  });
}

/**
 * 删除
 */
function handleDelete(row: any) {
  const ids = [row.id || state.ids].join(',');
  if (!ids) {
    ElMessage.warning('请勾选删除项');
    return;
  }

  ElMessageBox.confirm(`确认删除已选中的数据项?`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      deleteDept(ids)
        .then(() => {
          handleQuery();
          ElMessage.success('删除成功');
        })
        .catch(() => {
          ElMessage.error('删除失败');
        });
    })
    .catch(() => ElMessage.warning('已取消删除'));
}

/**
 * 关闭弹窗
 **/
function closeDialog() {
  dialog.value.visible = false;
  dataFormRef.value.resetFields();
  dataFormRef.value.clearValidate();
}

onMounted(() => {
  handleQuery();
});
</script>
<template>
  <div class="app-container">
    <div class="search">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="关键字" prop="keywords">
          <el-input
            v-model="queryParams.keywords"
            placeholder="部门名称"
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item label="部门状态" prop="status">
          <el-select
            v-model="queryParams.status"
            placeholder="部门状态"
            clearable
          >
            <el-option :value="1" label="正常" />
            <el-option :value="0" label="禁用" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            class="filter-item"
            type="primary"
            :icon="Search"
            @click="handleQuery"
          >
            搜索
          </el-button>
          <el-button :icon="Refresh" @click="resetQuery"> 重置 </el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card>
      <!--toolbar-->
      <template #header>
        <el-button type="success" :icon="Plus" @click="handleAdd"
          >新增</el-button
        >
        <el-button
          type="danger"
          :icon="Delete"
          @click="handleDelete"
          :disabled="ids.length === 0"
          >删除
        </el-button>
      </template>

      <!--table-->
      <el-table
        v-loading="loading"
        :data="dataList"
        row-key="id"
        default-expand-all
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="name" label="部门名称" min-width="300" />
        <el-table-column prop="status" label="状态" width="200">
          <template #default="scope">
            <el-tag v-if="scope.row.status == 1" type="success">正常</el-tag>
            <el-tag v-else type="info">禁用</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="sort" label="排序" width="200" />

        <el-table-column prop="createTime" label="创建时间" width="250" />
        <el-table-column prop="updateTime" label="修改时间" width="250" />

        <el-table-column label="操作" align="center" width="150">
          <template #default="scope">
            <el-button type="primary" link @click.stop="handleAdd(scope.row)"
              >新增
            </el-button>
            <el-button type="success" link @click.stop="handleUpdate(scope.row)"
              >编辑
            </el-button>
            <el-button type="danger" link @click.stop="handleDelete(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- dialog -->
    <el-dialog
      :title="dialog.title"
      v-model="dialog.visible"
      width="600px"
      @closed="closeDialog"
    >
      <el-form
        ref="dataFormRef"
        :model="formData"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="上级部门" prop="parentId">
          <el-tree-select
            v-model="formData.parentId"
            placeholder="选择上级部门"
            :data="deptOptions"
            filterable
            check-strictly
            :render-after-expand="false"
          />
        </el-form-item>
        <el-form-item label="部门名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入部门名称" />
        </el-form-item>
        <el-form-item label="显示排序" prop="sort">
          <el-input-number
            v-model="formData.sort"
            controls-position="right"
            style="width: 100px"
            :min="0"
          />
        </el-form-item>
        <el-form-item label="部门状态">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm"> 确 定 </el-button>
          <el-button @click="closeDialog"> 取 消 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
