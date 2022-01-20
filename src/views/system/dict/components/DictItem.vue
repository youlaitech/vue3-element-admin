<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form
        :model="state.queryParams"
        ref="queryForm"
        :inline="true"
        size="mini"
    >
      <el-form-item>
        <el-button type="success" :icon="Plus" @click="handleAdd">新增</el-button>
        <el-button type="danger" :icon="Delete" :disabled="state.multiple" @click="handleDelete">删除</el-button>
      </el-form-item>
      <el-form-item prop="name">
        <el-input
            v-model="state.queryParams.name"
            placeholder="数据项名称"
            clearable/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="handleQuery">搜索</el-button>
        <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 数据表格 -->
    <el-table
        :data="state.pageList"
        v-loading="state.loading"
        border
        @selection-change="handleSelectionChange"
        size="mini"
    >
      <el-table-column type="selection" min-width="5%"/>
      <el-table-column label="数据项名称" prop="name"/>
      <el-table-column label="数据项值" prop="value"/>
      <el-table-column label="状态" align="center">
        <template #default="scope">
          <el-tag v-if="scope.row.status===1" type="success" size="mini">启用</el-tag>
          <el-tag v-else type="info" size="mini">禁用</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
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
        v-model:page="state.queryParams.pageNum"
        v-model:limit="state.queryParams.pageSize"
        @pagination="handleQuery"
    />

    <!-- 表单弹窗 -->
    <el-dialog
        :title="state.dialog.title"
        v-model="state.dialog.visible"
        width="500px"
        @close="cancel"
    >
      <el-form
          ref="dataForm"
          :model="state.formData"
          :rules="state.rules"
          label-width="100px"
      >
        <el-form-item label="字典名称">
          <el-input v-model="props.dictName" :disabled="true"/>
        </el-form-item>
        <el-form-item label="字典项名称" prop="name">
          <el-input v-model="state.formData.name" placeholder="请输入字典项名称"/>
        </el-form-item>
        <el-form-item label="字典项值" prop="value">
          <el-input v-model="state.formData.value" placeholder="请输入字典项值"/>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="state.formData.sort" style="width: 80px;" controls-position="right" :min="0"/>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="state.formData.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="state.formData.remark" type="textarea"></el-input>
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

<script setup lang="ts">
import {
  listDictItemsWithPage,
  getDictItemDetail,
  addDictItem,
  updateDictItem,
  deleteDictItem
} from "@/api/system/dict";
import {Search, Plus, Edit, Refresh, Delete} from '@element-plus/icons';
import {onMounted, reactive, ref, unref, watch} from 'vue'
import {ElForm, ElMessage, ElMessageBox} from "element-plus";

const props = defineProps({
  dictCode: {
    type: String,
    default: ''
  },
  dictName: {
    type: String,
    default: ''
  }
})

watch(() => props.dictCode, (newVal, oldVal) => {
  state.queryParams.dictCode = newVal
  handleQuery()
})

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
    name: undefined,
    dictCode: ''
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
    remark: undefined,
    sort:undefined,
    value:undefined
  },
  rules: {
    name: [
      {required: true, message: '请输入字典项名称', trigger: 'blur'}
    ],
    value: [
      {required: true, message: '请输入字典项值', trigger: 'blur'}
    ]
  }
})

function handleQuery() {
  if (state.queryParams.dictCode) {
    state.loading = true
    listDictItemsWithPage(state.queryParams).then(response => {
      const {data, total} = response as any
      state.pageList = data
      state.total = total
      state.loading = false
    })
  } else {
    state.loading = false
    state.pageList = []
    state.total = 0
    state.queryParams.pageNum = 1
  }
}

function resetQuery() {
  state.queryParams = {
    pageNum: 1,
    pageSize: 10,
    name: undefined,
    dictCode: ''
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
    title: '添加字典项',
    visible: true,
  }
}

function handleUpdate(row: any) {
  resetForm()
  state.dialog = {
    title: '修改字典项',
    visible: true
  }
  const id = row.id || state.ids
  getDictItemDetail(id).then(response => {
    state.formData = response.data
  })
}

const dataForm = ref(ElForm)

function submitForm() {
  const form = unref(dataForm)
  form.validate((valid: any) => {
    if (valid) {
      if (state.formData.id) {
        updateDictItem(state.formData.id, state.formData).then(response => {
          ElMessage.success('修改成功')
          state.dialog.visible = false
          handleQuery()
        })
      } else {
        addDictItem(state.formData).then(response => {
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
    remark: undefined,
    sort:undefined,
    value:undefined
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
    deleteDictItem(ids).then(() => {
      ElMessage.success('删除成功')
      handleQuery()
    })
  }).catch(() =>
      ElMessage.info('已取消删除')
  )
}

onMounted(() => {
  handleQuery()
})
</script>

<style scoped>

</style>
