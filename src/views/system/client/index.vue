<!-- setup 无法设置组件名称，组件名称keepAlive必须 -->
<script lang="ts">
export default {
  name: 'client',
};
</script>

<script setup lang="ts">
import {
  listClientPages,
  getClientFormDetial,
  addClient,
  updateClient,
  deleteClients,
} from '@/api/system/client';
import { Search, Plus, Edit, Refresh, Delete } from '@element-plus/icons-vue';
import { onMounted, reactive, getCurrentInstance, ref, toRefs } from 'vue';
import { ElForm, ElMessage, ElMessageBox } from 'element-plus';
import {
  ClientFormData,
  ClientItem,
  ClientQueryParam,
} from '@/types/api/system/client';
import { Option } from '@/types/common';

const { proxy }: any = getCurrentInstance();

const queryFormRef = ref(ElForm);
const dataFormRef = ref(ElForm);
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
  } as ClientQueryParam,
  clientList: [] as ClientItem[],
  total: 0,
  dialog: {
    title: '',
    visible: false,
    type: 'create',
  },
  formData: {} as ClientFormData,
  rules: {
    clientId: [
      { required: true, message: '客户端ID不能为空', trigger: 'blur' },
    ],
  },
  authorizedGrantTypesOptions: [] as Option[],
  checkedAuthorizedGrantTypes: [] as string[],
});

const {
  loading,
  ids,
  multiple,
  queryParams,
  clientList,
  total,
  dialog,
  formData,
  rules,
  authorizedGrantTypesOptions,
  checkedAuthorizedGrantTypes,
} = toRefs(state);

function handleQuery() {
  listClientPages(state.queryParams).then(({ data }) => {
    state.clientList = data.list;
    state.total = data.total;
    state.loading = false;
  });
}

function resetQuery() {
  queryFormRef.value.resetFields();
  handleQuery();
}

function handleSelectionChange(selection: any) {
  state.ids = selection.map((item: any) => item.clientId);
  state.single = selection.length !== 1;
  state.multiple = !selection.length;
}

function handleAdd() {
  proxy.$getDictItemsByTypeCode('grant_type').then((response: any) => {
    state.authorizedGrantTypesOptions = response.data;
  });

  state.dialog = {
    title: '添加客户端',
    visible: true,
    type: 'create',
  };
}

function handleUpdate(row: any) {
  state.dialog = {
    title: '修改客户端',
    visible: true,
    type: 'edit',
  };
  const clientId = row.clientId || ids;

  proxy.$getDictItemsByTypeCode('grant_type').then((res: any) => {
    state.authorizedGrantTypesOptions = res.data;

    getClientFormDetial(clientId).then(({ data }) => {
      state.formData = data;
      state.checkedAuthorizedGrantTypes = data.authorizedGrantTypes?.split(',');
    });
  });
}

function submitForm() {
  dataFormRef.value.validate((isvalid: boolean) => {
    if (isvalid) {
      state.formData.authorizedGrantTypes =
        state.checkedAuthorizedGrantTypes.join(',');
      if (state.dialog.type == 'edit') {
        updateClient(state.formData.clientId, state.formData).then(() => {
          ElMessage.success('修改成功');
          state.dialog.visible = false;
          cancel();
          handleQuery();
        });
      } else {
        addClient(state.formData).then(() => {
          ElMessage.success('新增成功');
          cancel();
          handleQuery();
        });
      }
    }
  });
}

function cancel() {
  state.dialog.visible = false;
  dataFormRef.value.resetFields();
  state.checkedAuthorizedGrantTypes = [];
}

function handleDelete(row: any) {
  const clientIds = [row.clientId || ids].join(',');
  ElMessageBox.confirm('确认删除已选中的数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      deleteClients(clientIds).then(() => {
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

      <el-form-item>
        <el-input
          v-model="queryParams.keywords"
          placeholder="客户端ID"
          clearable
          style="width: 240px"
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
      v-loading="loading"
      :data="clientList"
      border
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" width="55" align="center" />
      <el-table-column label="客户端ID" prop="clientId" width="200" />
      <el-table-column label="客户端密钥" prop="clientSecret" width="100" />
      <el-table-column label="域" width="100" prop="scope" />
      <el-table-column label="自动放行" prop="autoapprove" width="100" />
      <el-table-column label="授权方式" prop="authorizedGrantTypes" />
      <el-table-column
        label="认证令牌时效(单位：秒)"
        width="200"
        prop="accessTokenValidity"
      />
      <el-table-column
        label="刷新令牌时效(单位：秒)"
        width="200"
        prop="refreshTokenValidity"
      />
      <el-table-column label="操作" align="center" width="120">
        <template #default="scope">
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
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="700px">
      <el-form
        ref="dataFormRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
      >
        <el-row>
          <el-col :span="12">
            <el-form-item label="客户端ID" prop="clientId">
              <el-input
                v-model="formData.clientId"
                placeholder="请输入客户端ID"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="客户端密钥" prop="clientSecret">
              <el-input
                v-model="formData.clientSecret"
                placeholder="请输入客户端密钥"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="域" prop="scope">
              <el-input v-model="formData.scope" placeholder="请输入域" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="自动放行" prop="autoapprove">
              <el-radio-group v-model="formData.autoapprove">
                <el-radio label="true">是</el-radio>
                <el-radio label="false">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="授权方式" prop="authorizedGrantTypes">
          <el-checkbox-group v-model="checkedAuthorizedGrantTypes">
            <el-checkbox
              v-for="item in authorizedGrantTypesOptions"
              :key="item.value"
              :label="item.value"
              >{{ item.label }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-row>
          <el-col :span="12">
            <el-form-item label="认证令牌时效" prop="accessTokenValidity">
              <el-input
                v-model="formData.accessTokenValidity"
                placeholder="请输入认证令牌时效"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="刷新令牌时效" prop="refreshTokenValidity">
              <el-input
                v-model="formData.refreshTokenValidity"
                placeholder="请输入刷新令牌时效"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="回调地址" prop="webServerRedirectUri">
              <el-input
                v-model="formData.webServerRedirectUri"
                placeholder="请输入回调地址"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="权限" prop="authorities">
              <el-input
                v-model="formData.authorities"
                placeholder="请输入权限"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="扩展信息" prop="additionalInformation">
              <el-input
                v-model="formData.additionalInformation"
                type="textarea"
                placeholder="JSON格式"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm"> 确定 </el-button>
          <el-button @click="cancel"> 取消 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
