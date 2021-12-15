<template>
  <div class="app-container">

    <el-form
        size="mini"
        :model="dataMap.queryParams"
        ref="queryForm"
        :inline="true"
        v-show="dataMap.showSearch"
    >
      <el-form-item>
        <el-button type="success" :icon="Plus" @click="handleAdd">新增</el-button>
        <el-button type="danger" :icon="Delete" :disabled="dataMap.single" @click="handleDelete">删除
        </el-button>
      </el-form-item>

      <el-form-item
          prop="name"
      >
        <el-input
            v-model="dataMap.queryParams.name"
            placeholder="请输入部门名称"
            size="small"
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item
          prop="status"
      >
        <el-select
            v-model="dataMap.queryParams.status"
            placeholder="部门状态"
            clearable
            size="small"
        >
          <el-option
              v-for="dict in dataMap.statusOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
            class="filter-item"
            type="primary"
            size="mini"
            :icon="Search"
            @click="handleQuery"
        >
          搜索
        </el-button>
        <el-button
            :icon="Refresh"
            size="mini"
            @click="resetQuery"
        >
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <el-table
        v-loading="dataMap.loading"
        :data="dataMap.deptList"
        row-key="id"
        default-expand-all
        :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
        @selection-change = "handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column prop="name" label="部门名称"/>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.status==1" type="success">正常</el-tag>
          <el-tag v-else type="info">禁用</el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="sort" label="显示排序" width="200"/>


      <el-table-column
          label="操作"
          align="center" width="150"
      >
        <template #default="scope">
          <el-button
              type="primary"
              :icon="Edit"
              size="mini"
              circle
              plain
              @click.stop="handleUpdate(scope.row)"
          >
          </el-button>
          <el-button
              type="success"
              size="mini"
              :icon="Plus"
              circle
              plain
              @click.stop="handleAdd(scope.row)"
          >
          </el-button>

          <el-button
              type="danger"
              :icon="Delete"
              size="mini"
              circle
              plain
              @click.stop="handleDelete(scope.row)">
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改部门对话框 -->
    <el-dialog
        :title="dataMap.title"
        v-model="dataMap.open"
        width="600px"
        @open="dialogshow"
        @closed="cancel"
    >
      <el-form
          ref="formDialog"
          :model="dataMap.formVal"
          :rules="dataMap.rules"
          label-width="80px"
      >
        <el-form-item
            label="上级部门"
            prop="parentId"
        >
          <tree-select
              :options="dataMap.deptOptions"
              placeholder="选择上级部门"
              v-model:value="dataMap.formVal.parentId"
          />
        </el-form-item>
        <el-form-item label="部门名称" prop="name">
          <el-input v-model="dataMap.formVal.name" placeholder="请输入部门名称"/>
        </el-form-item>
        <el-form-item label="显示排序" prop="sort">
          <el-input-number v-model="dataMap.formVal.sort" controls-position="right" style="width: 100px" :min="0"/>
        </el-form-item>
        <el-form-item label="部门状态">
          <el-radio-group v-model="dataMap.formVal.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <div
            class="dialog-footer"
        >
          <el-button
              type="primary"
              @click="submitForm"
          >
            确 定
          </el-button>
          <el-button @click="cancel">
            取 消
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {onMounted, reactive, unref, ref} from 'vue'
import {Search, Plus, Edit, Refresh, Delete} from '@element-plus/icons'
import {listDept, getDept, delDept, updateDept, addDept, getDeptSelectList} from '@/api/system/dept'
import TreeSelect from '@/components/TreeSelect/Index.vue'
import {ElForm, ElMessage, ElMessageBox} from 'element-plus'


const dataMap = reactive({
  // 选中ID数组
  ids: [],
  // 非单个禁用
  single: true,
  // 非多个禁用
  multiple: true,
  disabled: false,
  isAdd: false,
  originOptions: [],
  props: { // 配置项（必选）
    value: 'id',
    label: 'label',
    children: 'children'
  },
  loading: true,
  // 显示搜索条件
  showSearch: true,
  // 表格树数据
  deptList: [],
  // 部门树选项
  deptOptions: [],
  // 弹出层标题
  title: '',
  // 是否显示弹出层
  open: false,
  // 状态数据字典
  statusOptions: [
    {
      "dictValue": 0,
      "dictLabel": "禁用"
    },
    {
      "dictValue": 1,
      "dictLabel": "正常"
    }
  ],
  // 查询参数
  queryParams: {
    name: undefined,
    status: undefined
  },
  formVal: {
    id: '',
    parentId: '',
    name: '',
    sort: 1,
    status: ''
  },

  deptidfix: 1,
  // 表单参数校验
  rules: {
    parentId: [
      {required: true, message: '上级部门不能为空', trigger: 'blur'}
    ],
    name: [
      {required: true, message: '部门名称不能为空', trigger: 'blur'}
    ],
    sort: [
      {required: true, message: '显示排序不能为空', trigger: 'blur'}
    ]
  }
})
const queryForm = ref(ElForm)
const formDialog = ref(ElForm)

/**
 * 删除按钮
 * */
function handleSelectionChange(selection: any) {
  dataMap.ids = selection.map((item: any) => item.id)
  dataMap.single = selection.length === 0
}

/** 查询部门列表 */
function getList() {
  dataMap.loading = true
  listDept(dataMap.queryParams).then((response: any) => {
    dataMap.deptList = response.data
    dataMap.loading = false
  })
}

// 取消按钮
function cancel() {
  dataMap.open = false
  dataMap.isAdd = false
  dataMap.formVal = {
    id: '',
    parentId: '',
    name: '',
    sort: 1,
    status: ''
  }
}

/** 搜索按钮操作 */
function handleQuery() {
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  const form = unref(queryForm)
  form.resetFields()
  handleQuery()
}

/** 查询部门下拉树结构 */
function getTreeselect() {
  getDeptSelectList().then(response => {
    dataMap.deptOptions = response.data
  })
}

function handleAdd(row: any) {
  dataMap.isAdd = true
  if (row.id) {
    dataMap.formVal.parentId = row.id.toString()
  }
  dataMap.open = true
  dataMap.title = '添加部门'
}

/** 修改按钮操作 */
async function handleUpdate(row: any) {
  dataMap.disabled = true
  dataMap.isAdd = false
  dataMap.deptidfix = row.id
  try {
    const result = await getDept(row.id) as any
    dataMap.formVal = result.data
    dataMap.title = '修改部门'
    dataMap.open = true
  } catch (e) {
    console.log("获取部门数据失败")
  }

}

/** 提交按钮 */
function submitForm() {
  const formNode = unref(formDialog)
  formNode.validate((valid: any) => {
    if (valid) {
      if (!dataMap.isAdd) {
        updateDept(dataMap.deptidfix, dataMap.formVal).then((res: any) => {
          ElMessage.success('修改成功')
          dataMap.open = false
          getList()
        })
      } else {
        addDept(dataMap.formVal).then((res: any) => {
          ElMessage.success('新增成功')
          dataMap.open = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
async function handleDelete(row: any) {
  const ids = [row.id || dataMap.ids].join(',')
    ElMessageBox.confirm(`确认删除已选中的数据项?`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
       delDept(ids).then(rps=>{
         getList()
         ElMessage.success('删除成功')
       }).catch(e=>{
         console.log(`删除失败:${e}`)
       })
      }).catch(() =>
        ElMessage.info('已取消删除')
    )
}


function getDeptId(e: any) {
  dataMap.formVal.parentId = e
}

function dialogshow() {
  getTreeselect()
}

onMounted(() => {
  getList()
  getTreeselect()
})

</script>
