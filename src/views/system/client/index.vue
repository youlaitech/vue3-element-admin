<template>
  <div class="app-container">
    <!-- 搜索表单 Begin -->
    <el-form
        ref="queryForm"
        :model="state.queryParams"
        :inline="true"
        size="mini"
    >
      <el-form-item>
        <el-button type="primary" :icon="Plus" @click="handleAdd">新增</el-button>
        <el-button type="success" :icon="Edit" :disabled="state.single" @click="handleUpdate">修改</el-button>
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

    <!-- 数据表格  -->
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
        :page.sync="state.queryParams.pageNum"
        :limit.sync="state.queryParams.pageSize"
        @pagination="handleQuery"
    />

  </div>
</template>

<script setup lang="ts">
import {list, detail, update, add, del} from '@/api/system/client'
import {Search, Plus, Edit, Refresh, Delete} from '@element-plus/icons'
import {onMounted, reactive, toRefs, ref, unref} from 'vue'

const state = reactive({
  loading: true,
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
    title: undefined,
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
  },
})

function handleQuery() {
  list(state.queryParams).then(response => {
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

}

function handleUpdate(row: any) {

}

function submitForm() {

}

onMounted(() => {
  handleQuery()
})

</script>
