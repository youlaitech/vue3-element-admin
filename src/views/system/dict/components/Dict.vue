<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form size="mini"
             :model="state.queryParams"
             ref="queryForm"
             :inline="true"
    >
      <el-form-item>
        <el-button type="success" :icon="Plus" @click="handleAdd">新增</el-button>
        <el-button type="danger" :icon="Delete" :disabled="state.single" @click="handleDelete">删除
        </el-button>
      </el-form-item>

      <el-form-item prop="name">
        <el-input
            v-model="state.queryParams.name"
            placeholder="字典名称"
            clearable
            @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="handleQuery">搜索</el-button>
        <el-button :icon="Refresh" @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 数据表格 -->
    <el-table
        :data="state.pageList"
        v-loading="state.loading"
        @row-click="handleRowClick"
        @selection-change="handleSelectionChange"
        border
        size="mini"
    >
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="字典名称" prop="name" width="120"/>
      <el-table-column label="字典编码" prop="code"/>
      <el-table-column label="状态" align="center" width="80">
        <template #default="scope">
          <el-switch
              size="mini"
              v-model="scope.row.status"
              :active-value="1"
              :inactive-value="0"
          />
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="150">
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
    <pagination
        v-show="state.total>0"
        :total="state.total"
        :page.sync="state.queryParams.pageNum"
        :limit.sync="state.queryParams.pageSize"
        @pagination="handleQuery"
    />

    <!-- 弹窗表单 -->
    <el-dialog
        :title="state.dialog.title"
        v-model="state.dialog.visible"
        width="500px"
        @close="cancel">
      <el-form
          ref="dataForm"
          :model="state.formData"
          :rules="state.rules"
          label-width="80px">
        <el-form-item label="字典名称" prop="name">
          <el-input v-model="state.formData.name" placeholder="请输入字典名称"/>
        </el-form-item>
        <el-form-item label="字典编码" prop="code">
          <el-input v-model="state.formData.code" placeholder="请输入字典编码"/>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="state.formData.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="state.formData.remark" type="textarea" placeholder="请输入内容"></el-input>
        </el-form-item>
      </el-form>
      <template  #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {listDictWithPage, getDictDetail, addDict, updateDict, deleteDict} from "@/api/system/dict";
import {Search, Plus, Edit, Refresh, Delete} from '@element-plus/icons'
import {onMounted, reactive, getCurrentInstance, ref, unref} from 'vue'
import {ElForm, ElMessage, ElMessageBox} from "element-plus";

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
    name: undefined
  },
  pageList: [],
  total: 0,
  dialog: {
    title: '',
    visible: false
  },
  formData: {
    id: undefined,
    name: undefined,
    code: undefined,
    status: undefined,
    remark: undefined
  },
  rules: {
    clientId: [
      {required: true, message: '客户端ID不能为空', trigger: 'blur'}
    ]
  }
})

function handleQuery() {
  state.loading = true
  listDictWithPage(state.queryParams).then(response => {
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
    name: undefined
  }
  handleQuery()
}


function handleSelectionChange(selection: any) {
  state.ids = selection.map((item: any) => item.id)
  state.single = selection.length !== 1
  state.multiple = !selection.length
}

function handleAdd() {
  resetForm()
  state.dialog = {
    title: '添加字典',
    visible: true,
  }
}

function handleUpdate(row: any) {
  resetForm()
  state.dialog = {
    title: '修改字典',
    visible: true
  }
  const id = row.id || state.ids
  getDictDetail(id).then(response => {
    state.formData = response.data
  })
}

function submitForm() {
  const dataForm = ref(ElForm)
  const form = unref(dataForm)
  form.validate((valid: any) => {
    if (valid) {
      if (state.formData.id) {
        updateDict(state.formData.id, state.formData).then(response => {
          ElMessage.success('修改成功')
          state.dialog.visible = false
          handleQuery()
        })
      } else {
        addDict(state.formData).then(response => {
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
    id: undefined,
    name: undefined,
    code: undefined,
    status: undefined,
    remark: undefined
  }
}

function cancel() {
  state.dialog.visible = false
}

function handleDelete(row: any) {
  const ids = [row.id || state.ids].join(',')
  ElMessageBox.confirm('确认删除已选中的数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteDict(ids).then(() => {
      ElMessage.success('删除成功')
      handleQuery()
    })
  }).catch(() =>
      ElMessage.info('已取消删除')
  )
}

function handleRowClick(row: any) {
  console.log("handleRowClick")
}

onMounted(() => {
  handleQuery()
})

</script>