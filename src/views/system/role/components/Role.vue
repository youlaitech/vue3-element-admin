<template>
  <div>
    <!-- 搜索表单 -->
    <el-form
        ref="queryForm"
        :model="queryParams"
        size="mini"
        :inline="true"
    >
      <el-form-item>
        <el-button type="success" :icon="Plus" @click="handleAdd">新增</el-button>
        <el-button type="danger" :icon='Delete' :disabled="multiple" @click="handleDelete">删除</el-button>
      </el-form-item>

      <el-form-item prop="name">
        <el-input
            v-model="queryParams.name"
            placeholder="角色名称"
            clearable
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
        ref="roleTable"
        v-loading="loading"
        :data="pageList"
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
        border
        highlight-current-row
        size="mini"
    >
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="角色名称" prop="name"/>
      <el-table-column label="角色编码" prop="code"/>
      <el-table-column label="操作" align="center" width="100">
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
        v-show="total>0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="handleQuery"
    />

    <!-- 表单弹窗 -->
    <el-dialog
        :title="dialog.title"
        v-model="dialog.visible"
        width="450px"
    >
      <el-form
          ref="dataForm"
          :model="formData"
          :rules="rules"
          label-width="100px"
      >
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入角色名称"/>
        </el-form-item>

        <el-form-item label="角色编码" prop="code">
          <el-input v-model="formData.code" placeholder="请输入角色编码"/>
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" controls-position="right" :min="0" style="width: 100px"/>
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
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>

    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {listRolesWithPage, updateRole, getRoleDetail, addRole, deleteRoles} from '@/api/system/role'
import {defineEmits, defineProps, onMounted, reactive, ref, toRefs, unref} from "vue"
import {add, del, detail, update} from "@api/system/client";
import {ElForm, ElMessage, ElMessageBox} from "element-plus";
import {Search, Plus, Edit, Refresh, Delete} from '@element-plus/icons'

const emit = defineEmits(['roleClick'])

const dataForm = ref(ElForm)  // 属性名必须和元素的ref属性值一致

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
    sort: 100,
    status: 1
  },
  rules: {
    name: [
      {required: true, message: '请输入角色名称', trigger: 'blur'}
    ],
    code: [
      {required: true, message: '请输入角色编码', trigger: 'blur'}
    ]
  }
})

const {loading,single, multiple, queryParams, pageList, total, dialog, formData, rules} = toRefs(state)

function handleQuery() {
  emit('roleClick', {})
  state.loading = true
  listRolesWithPage(state.queryParams).then(response => {
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

function handleRowClick(row: any) {
  emit('roleClick', row)
}

function handleAdd() {
  resetForm()
  state.dialog = {
    title: '添加角色',
    visible: true
  }
}

function handleUpdate(row: any) {
  resetForm()
  state.dialog = {
    title: '修改角色',
    visible: true,
  }
  const roleId = row.id || state.ids
  getRoleDetail(roleId).then((response) => {
    state.formData = response.data
  })
}

function submitForm() {
  const form = unref(dataForm)
  form.validate((valid: any) => {
    if (valid) {
      if (state.formData.id) {
        updateRole(state.formData.id as any, state.formData).then(response => {
          ElMessage.success('修改成功')
          state.dialog.visible = false
          handleQuery()
        })
      } else {
        addRole(state.formData).then(response => {
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
    sort: 100,
    status: 1
  }
}

function cancel() {
  resetForm()
  state.dialog.visible = false
}

function handleDelete(row: any) {
  const ids = [row.id || state.ids].join(',')
  ElMessageBox.confirm('确认删除已选中的数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteRoles(ids).then(() => {
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
