<script setup lang="ts">
import {
  onMounted,
  watch,
  reactive,
  ref,
  getCurrentInstance,
  toRefs,
} from 'vue';

import {
  listPermPages,
  getPermFormDetail,
  addPerm,
  updatePerm,
  deletePerms,
} from '@/api/system/perm';
import { Search, Plus, Edit, Refresh, Delete } from '@element-plus/icons-vue';

import { ElForm, ElMessage, ElMessageBox } from 'element-plus';
import { Dialog, Option } from '@/types/common';

import {
  PermFormData,
  PermItem,
  PermQueryParam,
} from '@/types/api/system/perm';
import { MenuItem } from '@/types/api/system/menu';

const { proxy }: any = getCurrentInstance();

const queryFormRef = ref(ElForm);
const dataFormRef = ref(ElForm);

const props = defineProps({
  menu: {
    type: Object,
    default: () => {
      return {} as MenuItem;
    },
  },
});

watch(
  () => props.menu,
  (value) => {
    queryParams.value.menuId = value.id;
    console.log('menu', value);
    handleQuery();
  },
  {
    deep: true,
  }
);

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
  } as PermQueryParam,
  permList: [] as PermItem[],
  total: 0,
  dialog: {
    visible: false,
  } as Dialog,
  formData: {} as PermFormData,
  rules: {
    name: [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
    perm: [{ required: true, message: '请输入权限标识', trigger: 'blur' }],
    method: [{ required: true, message: '请选择请求方式', trigger: 'blur' }],
  },
  microServiceOptions: [] as Option[],
  requestMethodOptions: [] as Option[],
  urlPerm: {
    requestMethod: '',
    serviceName: '',
    requestPath: '',
  },
});

const {
  loading,
  multiple,
  permList,
  total,
  dialog,
  formData,
  rules,
  microServiceOptions,
  requestMethodOptions,
  urlPerm,
  queryParams,
} = toRefs(state);

function handleQuery() {
  if (state.queryParams.menuId) {
    state.loading = true;
    listPermPages(state.queryParams).then(({ data }) => {
      state.permList = data.list;
      state.total = data.total;
      state.loading = false;
    });
  } else {
    state.loading = false;
    state.permList = [];
    state.total = 0;
    state.queryParams.pageNum = 1;
  }
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

/**
 * 加载字典数据
 */
function loadDictOptions() {
  proxy.$getDictItemsByTypeCode('micro_service').then((response: any) => {
    state.microServiceOptions = response.data;
  });

  proxy.$getDictItemsByTypeCode('request_method').then((response: any) => {
    state.requestMethodOptions = response.data;
  });
}

function handleAdd() {
  loadDictOptions();
  state.dialog = {
    title: '添加权限',
    visible: true,
  };
}

function handleUpdate(row: any) {
  loadDictOptions();
  state.dialog = {
    title: '修改权限',
    visible: true,
  };
  const id = row.id || state.ids;
  getPermFormDetail(id).then((response) => {
    const { data } = response;
    state.formData = data;
    if (data && data.urlPerm) {
      // GET:/youlai-admin/api/v1/users
      const urlPermArr = data.urlPerm.split(':');
      state.urlPerm.requestMethod = urlPermArr[0];
      state.urlPerm.serviceName = urlPermArr[1].substring(
        1,
        urlPermArr[1].substring(1).indexOf('/') + 1
      );
      state.urlPerm.requestPath = urlPermArr[1].substring(
        urlPermArr[1].substring(1).indexOf('/') + 1
      );
    }
  });
}

function submitForm() {
  dataFormRef.value.validate((isValid: any) => {
    if (isValid) {
      // 接口权限和按钮权限必填其一
      console.log(state.urlPerm.requestPath, state.formData.btnPerm);
      if (!(state.urlPerm.requestPath || state.formData.btnPerm)) {
        ElMessage.warning('请至少填写一种权限');
        return false;
      }
      // 如果填写了URL权限，完整性校验
      if (!state.urlPerm.requestPath) {
        if (!state.urlPerm.requestMethod) {
          ElMessage.warning('URL权限的请求方式不能为空');
          return false;
        }
        if (!state.urlPerm.serviceName) {
          ElMessage.warning('URL权限的所属服务不能为空');
          return false;
        }
        state.formData.urlPerm =
          state.urlPerm.requestMethod +
          ':/' +
          state.urlPerm.serviceName +
          state.urlPerm.requestPath;
      }

      formData.value.menuId = props.menu.id;
      if (state.formData.id) {
        updatePerm(state.formData.id, state.formData).then(() => {
          ElMessage.success('修改成功');
          cancel();
          handleQuery();
        });
      } else {
        addPerm(state.formData).then(() => {
          ElMessage.success('新增成功');
          cancel();
          handleQuery();
        });
      }
    }
  });
}

/**
 * 重置表单
 */
function resetForm() {
  dataFormRef.value.resetFields();

  state.urlPerm = {
    requestMethod: '',
    serviceName: '',
    requestPath: '',
  };
}

function cancel() {
  resetForm();
  state.dialog.visible = false;
}

function handleDelete(row: any) {
  const ids = [row.id || state.ids].join(',');
  ElMessageBox.confirm('确认删除已选中的数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      deletePerms(ids).then(() => {
        ElMessage.success('删除成功');
        handleQuery();
      });
    })
    .catch(() => ElMessage.info('已取消删除'));
}

onMounted(() => {
  handleQuery();
});
</script>

<template>
  <div claas="component-container">
    <!-- 搜索表单 -->
    <el-form ref="queryFormRef" :model="queryParams" :inline="true">
      <el-form-item>
        <el-button
          type="success"
          :icon="Plus"
          v-if="menu.id && menu.type == 'MENU'"
          @click="handleAdd"
          >新增</el-button
        >
        <el-button
          type="danger"
          :icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-if="menu.id && menu.type == 'MENU'"
          >删除</el-button
        >
      </el-form-item>
      <el-form-item prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="权限名称"
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
      :data="permList"
      v-loading="loading"
      @selection-change="handleSelectionChange"
      border
    >
      <el-table-column type="selection" width="40" align="center" />
      <el-table-column label="权限名称" prop="name" width="150" />
      <el-table-column label="URL权限" align="center">
        <el-table-column prop="serviceName" label="所属服务" />
        <el-table-column prop="requestMethod" label="请求方式" />
        <el-table-column prop="requestPath" label="请求路径" />
      </el-table-column>
      <el-table-column label="按钮权限" prop="btnPerm" width="200" />
      <el-table-column label="操作" align="center" width="150">
        <template #default="scope">
          <el-button
            type="primary"
            :icon="Edit"
            circle
            plain
            @click="handleUpdate(scope.row)"
          />
          <el-button
            type="danger"
            :icon="Delete"
            circle
            plain
            @click="handleDelete(scope.row)"
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
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="700px">
      <el-form
        ref="dataFormRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入权限名称" />
        </el-form-item>

        <el-form-item label="URL权限标识" prop="urlPerm">
          <el-input placeholder="/api/v1/users" v-model="urlPerm.requestPath">
            <template #prepend>
              <el-select
                v-model="urlPerm.serviceName"
                style="width: 130px"
                placeholder="所属服务"
                clearable
              >
                <el-option
                  v-for="item in microServiceOptions"
                  :key="item.value"
                  :value="item.value"
                  :label="item.label"
                />
              </el-select>

              <el-select
                v-model="urlPerm.requestMethod"
                style="width: 120px; margin-left: 20px"
                placeholder="请求方式"
                clearable
              >
                <el-option
                  v-for="item in requestMethodOptions"
                  :key="item.value"
                  :value="item.value"
                  :label="item.label"
                />
              </el-select>
            </template>
          </el-input>
          <el-link v-show="urlPerm.requestMethod">
            {{ urlPerm.requestMethod }}:/{{ urlPerm.serviceName
            }}{{ urlPerm.requestPath }}
          </el-link>
        </el-form-item>

        <el-form-item label="按钮权限标识" prop="btnPerm">
          <el-input v-model="formData.btnPerm" placeholder="sys:user:add" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.component-container {
  margin-bottom: 20px;
}
</style>
