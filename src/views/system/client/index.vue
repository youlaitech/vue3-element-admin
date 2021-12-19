<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form
        ref="queryForm"
        :model="state.queryParams"
        :inline="true"
        size="mini"
    >
      <el-form-item>
        <el-button type="success" :icon="Plus" @click="handleAdd">新增</el-button>
        <el-button type="danger" :icon='Delete' :disabled="state.multiple" @click="handleDelete">删除</el-button>
      </el-form-item>

      <el-form-item prop="clientId">
        <el-input
            v-model="state.queryParams.clientId"
            placeholder="输入客户端ID"
            clearable
            style="width: 240px"
            @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :icon="Search" @click="handleQuery">搜索</el-button>
        <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 数据表格 -->
    <el-table
        v-loading="state.loading"
        :data="state.pageList"
        border
        @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="序号" type="index" width="55" align="center"/>
      <el-table-column label="客户端ID" prop="clientId" width="200"/>
      <el-table-column label="客户端密钥" prop="clientSecret" width="100"/>
      <el-table-column label="域" width="100" prop="scope"/>
      <el-table-column label="自动放行" prop="autoapprove" width="100"/>
      <el-table-column label="授权方式" prop="authorizedGrantTypes"/>
      <el-table-column label="认证令牌时效(单位：秒)" width="200" prop="accessTokenValidity"/>
      <el-table-column label="刷新令牌时效(单位：秒)" width="200" prop="refreshTokenValidity"/>
      <el-table-column label="操作" align="center" width="120">
        <template #default="scope">
          <el-button
              type="primary"
              :icon="Edit"
              size="mini"
              circle
              plain
              @click.stop="handleUpdate(scope.row)"
          />
          <el-button
              type="danger"
              :icon="Delete"
              size="mini"
              circle
              plain
              @click.stop="handleDelete(scope.row)"
          />
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页工具条 -->
    <pagination
        v-show="state.total>0"
        :total="state.total"
        v-model:page="state.queryParams.pageNum"
        v-model:limit="state.queryParams.pageSize"
        @pagination="handleQuery"
    />

    <!-- 表单弹窗 -->
    <el-dialog
        :title="state.dialog.title"
        v-model="state.dialog.visible"
        width="700px"
    >
      <el-form ref="dataForm"
               :model="state.formData"
               :rules="state.rules"
               label-width="100px"
      >
        <el-form-item label="客户端ID" prop="clientId">
          <el-input v-model="state.formData.clientId" placeholder="请输入客户端ID"/>
        </el-form-item>

        <el-form-item label="客户端密钥" prop="clientSecret">
          <el-input v-model="state.formData.clientSecret" placeholder="请输入客户端密钥"/>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">
            确定
          </el-button>
          <el-button @click="cancel">
            取消
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {listClientsWithPage, detail, update, add, del} from '@/api/system/client'
import {Search, Plus, Edit, Refresh, Delete} from '@element-plus/icons'
import {onMounted, reactive, getCurrentInstance, ref, unref} from 'vue'
import {ElForm, ElMessage, ElMessageBox} from "element-plus"

const dataForm = ref(ElForm)
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
    clientId: undefined
  },
  pageList: [],
  total: 0,
  dialog: {
    title: '',
    visible: false,
    type: 'create'
  },
  formData: {
    authorizedGrantTypes: [],
    clientSecret: undefined,
    clientId: undefined,
    accessTokenValidity: undefined,
    refreshTokenValidity: undefined,
    webServerRedirectUri: undefined,
    authorities: undefined,
    additionalInformation: undefined,
    autoapprove: 'false'
  },
  rules: {
    clientId: [
      {required: true, message: '客户端ID不能为空', trigger: 'blur'}
    ]
  }
})

function handleQuery() {
  listClientsWithPage(state.queryParams).then(response => {
    const {data, total} = response as any
    state.pageList = data
    state.total = total
    state.loading = false
  })
}

function resetQuery() {
  state.queryParams = {
    pageNum: 1,
    pageSize: 10,
    clientId: undefined
  }
  handleQuery()
}

function handleSelectionChange(selection: any) {
  state.ids = selection.map((item: any) => item.clientId)
  state.single = selection.length !== 1
  state.multiple = !selection.length
}

function handleAdd() {
  resetForm()
  state.dialog = {
    title: '添加客户端',
    visible: true,
    type: 'create'
  }
}

function handleUpdate(row: any) {
  resetForm()
  state.dialog = {
    title: '修改客户端',
    visible: true,
    type: 'edit'
  }
  const clientId = row.clientId || state.ids
  detail(clientId).then(response => {
    state.formData = response.data
  })
}


function submitForm() {
  const form = unref(dataForm)
  form.validate((valid: any) => {
    if (valid) {
      if (state.dialog.type == 'edit') {
        update(state.formData.clientId as any, state.formData).then(response => {
          ElMessage.success('修改成功')
          state.dialog.visible = false
          handleQuery()
        })
      } else {
        add(state.formData).then(response => {
          ElMessage.success('新增成功')
          state.dialog.visible = false
          handleQuery()
        })
      }
    }
  })
}

function resetForm() {
  state.formData = {
    authorizedGrantTypes: [],
    clientSecret: undefined,
    clientId: undefined,
    accessTokenValidity: undefined,
    refreshTokenValidity: undefined,
    webServerRedirectUri: undefined,
    authorities: undefined,
    additionalInformation: undefined,
    autoapprove: 'false'
  }
}

function cancel() {
  resetForm()
  state.dialog.visible = false
}

function handleDelete(row: any) {
  const clientIds = [row.clientId || state.ids].join(',')
  ElMessageBox.confirm('确认删除已选中的数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    del(clientIds).then(() => {
      ElMessage.success('删除成功')
      handleQuery()
    })
  }).catch(() =>
      ElMessage.info('已取消删除')
  )
}

onMounted(() => {
  handleQuery()
  // 全局字典调用
  const {proxy}: any = getCurrentInstance();
  proxy.$getDictItemsByCode('gender').then((response: any) => {
    console.log('性别字典数据', response.data)
  })
})

</script>
