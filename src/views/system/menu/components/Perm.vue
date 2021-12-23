<template>
  <div>
    <!-- 搜索表单 -->
    <el-form
        ref="queryForm"
        size="mini"
        :model="state.queryParams"
        :inline="true"
    >
      <el-form-item>
        <el-button type="success" :icon="Plus" :disabled="state.disabled" @click="handleAdd">新增</el-button>
        <el-button type="danger" :icon="Delete" :disabled="state.multiple" @click="handleDelete">删除</el-button>
      </el-form-item>
      <el-form-item>
        <el-input
            v-model="state.queryParams.name"
            placeholder="权限名称"
            clearable
            @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="handleQuery">搜索</el-button>
        <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 数据表格 -->
    <el-table
        ref="dataTable"
        :data="state.pageList"
        v-loading="state.loading"
        @selection-change="handleSelectionChange"
        border
        size="mini"
    >
      <el-table-column type="selection" width="40" align="center"/>
      <el-table-column label="权限名称" prop="name" width="150"/>
      <el-table-column label="URL权限" align="center">
        <el-table-column prop="serviceName" label="所属服务"/>
        <el-table-column prop="requestMethod" label="请求方式"/>
        <el-table-column prop="requestPath" label="请求路径"/>
      </el-table-column>
      <el-table-column label="按钮权限" prop="btnPerm" width="200"/>
      <el-table-column label="操作" align="center" width="100">
        <template #default="scope">
          <el-button
              type="primary"
              :icon="Edit"
              size="mini"
              circle
              plain
              @click="handleUpdate(scope.row)"
          />
          <el-button
              type="danger"
              :icon="Delete"
              size="mini"
              circle
              plain
              @click="handleDelete(scope.row)"
          />
        </template>
      </el-table-column>
    </el-table>

    <pagination
        v-show="state.total>0"
        :total="state.total"
        :page="state.queryParams.pageNum"
        :limit="state.queryParams.pageSize"
        @pagination="handleQuery"
    />

    <!-- 表单弹窗 -->
    <el-dialog
        :title="state.dialog.title"
        v-model="state.dialog.visible"
        width="700px">
      <el-form
          ref="dataForm"
          :model="state.formData"
          :rules="state.rules"
          label-width="120px">

        <el-form-item label="权限名称" prop="name">
          <el-input v-model="state.formData.name" placeholder="请输入权限名称"/>
        </el-form-item>

        <el-form-item label="URL权限标识" prop="urlPerm">
          <el-input placeholder="/api/v1/users" v-model="state.urlPerm.requestPath" class="input-with-select">

            <template #prepend>
              <el-select
                  v-model="state.urlPerm.serviceName"
                  style="width: 130px;"
                  placeholder="所属服务"
                  clearable
              >
                <el-option v-for="item in state.microServiceOptions" :value="item.value" :label="item.name"/>
              </el-select>

              <el-select
                  v-model="state.urlPerm.requestMethod"
                  style="width: 120px;margin-left: 20px"
                  slot="prepend"
                  placeholder="请求方式"
                  clearable
              >
                <el-option
                    v-for="item in state.requestMethodOptions"
                    :value="item.value"
                    :label="item.name"
                />
              </el-select>
            </template>
          </el-input>
          <el-link v-show="state.urlPerm.requestMethod">
            {{ state.urlPerm.requestMethod }}:/{{ state.urlPerm.serviceName }}{{ state.urlPerm.requestPath }}
          </el-link>
        </el-form-item>

        <el-form-item label="按钮权限标识" prop="btnPerm">
          <el-input v-model="state.formData.btnPerm" placeholder="sys:user:add"/>
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
import {listPermsWithPage, getPermDetail, addPerm, updatePerm, deletePerms} from "@/api/system/perm"
import {Search, Plus, Edit, Refresh, Delete} from '@element-plus/icons'
import {onMounted, watch, reactive, ref, unref, getCurrentInstance} from 'vue'
import {ElForm, ElMessage, ElMessageBox} from "element-plus"

const {proxy}: any = getCurrentInstance();

const props = defineProps({
  menuId: {
    type: String,
    default: undefined
  },
  menuName: {
    type: String,
    default: ''
  }
})

watch(() => props.menuId as any, (newVal, oldVal) => {
  state.queryParams.menuId = newVal
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
    menuId: undefined,
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
    urlPerm: undefined,
    btnPerm: undefined,
    menuId: undefined
  },
  rules: {
    name: [
      {required: true, message: '请输入权限名称', trigger: 'blur'}
    ],
    perm: [
      {required: true, message: '请输入权限标识', trigger: 'blur'}
    ],
    method: [
      {required: true, message: '请选择请求方式', trigger: 'blur'}
    ]
  },
  microServiceOptions: [],
  requestMethodOptions: [],
  menuName: undefined,
  urlPerm: {
    requestMethod: undefined,
    serviceName: undefined,
    requestPath: undefined
  },
})

function handleQuery() {
  if (state.queryParams.menuId) {
    state.loading = true
    listPermsWithPage(state.queryParams).then(response => {
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
    menuId: undefined,
    name: undefined
  }
  handleQuery()
}

function handleSelectionChange(selection: any) {
  state.ids = selection.map((item: any) => item.id)
  state.single = selection.length !== 1
  state.multiple = !selection.length
}


/**
 * 字典数据准备
 */
function loadDictData() {
  proxy.$getDictItemsByCode('micro_service').then((response: any) => {
    state.microServiceOptions = response.data
  })

  proxy.$getDictItemsByCode('request_method').then((response: any) => {
    state.requestMethodOptions = response.data
  })
}

function handleAdd() {
  resetForm()
  loadDictData()
  state.dialog = {
    title: '添加权限',
    visible: true
  }
}

function handleUpdate(row: any) {
  resetForm()
  loadDictData()
  state.dialog = {
    title: '修改权限',
    visible: true
  }
  const id = row.id || state.ids
  getPermDetail(id).then(response => {
    const {data} = response
    state.formData = data
    if (data && data.urlPerm) {
      // GET:/youlai-admin/api/v1/users
      const urlPermArr = data.urlPerm.split(':')
      state.urlPerm.requestMethod = urlPermArr[0]
      state.urlPerm.serviceName = urlPermArr[1].substring(1, urlPermArr[1].substring(1).indexOf('/') + 1)
      state.urlPerm.requestPath = urlPermArr[1].substring(urlPermArr[1].substring(1).indexOf('/') + 1)
    }
  })
}

const dataForm = ref(ElForm)

function submitForm() {
  const form = unref(dataForm)
  form.validate((valid: any) => {
    if (valid) {
      // 接口权限和按钮权限必填其一
      console.log(state.urlPerm.requestPath, state.formData.btnPerm)
      if (!(state.urlPerm.requestPath || state.formData.btnPerm)) {
        ElMessage.warning('请至少填写一种权限')
        return false
      }

      // 如果填写了URL权限，完整性校验
      if (!state.urlPerm.requestPath) {
        if (!state.urlPerm.requestMethod) {
          ElMessage.warning('URL权限的请求方式不能为空')
          return false
        }
        if (!state.urlPerm.serviceName) {
          ElMessage.warning('URL权限的所属服务不能为空')
          return false
        }
        state.formData.urlPerm = state.urlPerm.requestMethod + ':/' + state.urlPerm.serviceName + state.urlPerm.requestPath;
      }

      state.formData.menuId = props.menuId
      if (state.formData.id) {
        updatePerm(state.formData.id, state.formData).then(response => {
          ElMessage.success('修改成功')
          state.dialog.visible = false
          handleQuery()
        })
      } else {
        addPerm(state.formData).then(response => {
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
    urlPerm: undefined,
    btnPerm: undefined
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
    deletePerms(ids).then(() => {
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
.perm-container {
  margin-bottom: 20px;
}
</style>

