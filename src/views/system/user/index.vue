<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!--部门数据-->
      <el-col
          :span="3"
          :xs="24"
      >
        <div class="head-container">
          <el-input
              v-model="dataMap.deptName"
              placeholder="请输入部门名称"
              clearable
              size="small"
              prefix-icon="el-icon-search"
              style="margin-bottom: 20px"
          />
        </div>
        <div class="head-container">
          <el-tree
              ref="treeRef"
              :data="dataMap.deptOptions"
              :props="dataMap.defaultProps"
              :expand-on-click-node="false"
              :filter-node-method="filterNode"
              default-expand-all
              @node-click="handleNodeClick"
          />
        </div>
      </el-col>
      <!--用户数据-->
      <el-col
          :span="21"
          :xs="24"
      >
        <el-form
            v-show="dataMap.showSearch"
            ref="queryForm"
            :model="dataMap.queryParams"
            :inline="true"

        >
          <el-form-item>
            <el-button
                type="primary"
                plain
                :icon="Plus"
                size="mini"
                @click="handleAdd"
            >
              新增
            </el-button>
            <el-button
                type="success"
                plain
                :icon="Edit"
                size="mini"
                :disabled="dataMap.single"
                @click="handleUpdate"
            >
              修改
            </el-button>
            <el-button
                type="danger"
                plain
                :icon="Delete"
                size="mini"
                :disabled="dataMap.multiple"
                @click="handleDelete"
            >
              删除
            </el-button>
          </el-form-item>

          <el-form-item
              label="关键字"
              prop="keywords"
          >
            <el-input
                v-model="dataMap.queryParams.keywords"
                placeholder="用户名/昵称/手机号"
                clearable
                size="small"
                style="width: 200px"
                @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item
              label="手机号码"
              prop="mobile"
          >
            <el-input
                v-model="dataMap.queryParams.mobile"
                placeholder="请输入手机号码"
                clearable
                size="small"
                style="width: 200px"
                @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item
              label="状态"
              prop="status"
          >
            <el-select
                v-model="dataMap.queryParams.status"
                placeholder="用户状态"
                clearable
                size="small"
                style="width: 200px"
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
                type="primary"
                :icon="Search"
                size="mini"
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
            :data="dataMap.userList"
            @selection-change="handleSelectionChange"
        >
          <el-table-column
              type="selection"
              width="50"
              align="center"
          />
          <el-table-column
              v-if="dataMap.columns[0].visible"
              key="id"
              label="用户编号"
              align="center"
              prop="id"
          />
          <el-table-column
              v-if="dataMap.columns[1].visible"
              key="username"
              label="用户名称"
              align="center"
              prop="username"
              :show-overflow-tooltip="true"
          />
          <el-table-column
              v-if="dataMap.columns[2].visible"
              key="nickname"
              label="用户昵称"
              align="center"
              prop="nickname"
              :show-overflow-tooltip="true"
          />
          <el-table-column
              v-if="dataMap.columns[3].visible"
              key="deptName"
              label="部门"
              align="center"
              prop="deptName"
              :show-overflow-tooltip="true"
          />
          <el-table-column
              v-if="dataMap.columns[4].visible"
              key="mobile"
              label="手机号码"
              align="center"
              prop="mobile"
              width="120"
          />

          <el-table-column
              v-if="dataMap.columns[5].visible"
              key="status"
              label="状态"
              align="center"
              prop="status"
          >
            <template #default="scope">
              <el-switch
                  v-model="scope.row.status"
                  :inactive-value=0
                  :active-value=1
                  @change="handleStatusChange(scope.row)"
              />
            </template>
          </el-table-column>
          <el-table-column
              v-if="dataMap.columns[6].visible"
              label="创建时间"
              align="center"
              prop="gmtCreate"
              width="180"
          >
          </el-table-column>
          <el-table-column
              label="操作"
              align="center"
              width="150"
          >
            <template #default="scope">
              <el-button
                  type="primary"
                  :icon="Edit"
                  size="mini"
                  circle
                  plain
                  @click="handleUpdate(scope.row)"
              >
              </el-button>
              <el-button
                  type="success"
                  size="mini"
                  :icon="Delete"
                  circle
                  plain
                  @click="handleDelete(scope.row)"
              >
              </el-button>
              <el-button
                  type="danger"
                  size="mini"
                  :icon="Refresh"
                  circle
                  plain
                  @click="handleResetPwd(scope.row)"
              >
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination
            v-show="dataMap.total>0"
            :total="dataMap.total"
            v-model:page="dataMap.queryParams.page"
            v-model:limit="dataMap.queryParams.limit"
            @pagination="getList"
        />
      </el-col>
    </el-row>

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog
        :title="dataMap.title"
        v-model="dataMap.open"
        width="600px"
        append-to-body
        @opened="showDialog"
        @close="cancel"
    >
      <el-form
          ref="addForm"
          :model="dataMap.formVal"
          :rules="dataMap.rules"
          label-width="80px"
      >
        <el-row>
          <el-col :span="12">
            <el-form-item
                label="用户昵称"
                prop="nickname"
            >
              <el-input
                  v-model="dataMap.formVal.nickname"
                  placeholder="请输入用户昵称"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
                label="归属部门"
                prop="deptId"
            >
              <tree-select
                  :options="dataMap.deptOptions"
                  placeholder="请选择归属部门"
                  v-model:value="dataMap.formVal.deptId"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item
                label="手机号码"
                prop="mobile"
            >
              <el-input
                  v-model="dataMap.formVal.mobile"
                  placeholder="请输入手机号码"
                  maxlength="11"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
                label="邮箱"
                prop="email"
            >
              <el-input
                  v-model="dataMap.formVal.email"
                  placeholder="请输入邮箱"
                  maxlength="50"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item
                v-if="dataMap.formVal.userId === undefined"
                label="用户名称"
                prop="userName"
            >
              <el-input
                  v-model="dataMap.formVal.username"
                  placeholder="请输入用户名称"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="dataMap.formVal.status">
                <el-radio
                    v-for="dict in dataMap.statusOptions"
                    :key="dict.dictValue"
                    :label="dict.dictValue"
                >
                  {{ dict.dictLabel }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>

        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户性别">
              <el-select
                  v-model="dataMap.formVal.gender"
                  placeholder="请选择"
              >
                <el-option
                    v-for="dict in dataMap.sexOptions"
                    :key="dict.value"
                    :label="dict.name"
                    :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色">
              <el-select
                  v-model="dataMap.formVal.roleIds"
                  multiple
                  placeholder="请选择"
              >
                <el-option
                    v-for="item in dataMap.roleOptions"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                    :disabled="item.status === 0"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>


          <el-col :span="12">
            <el-form-item
                v-if="dataMap.formVal.id === undefined"
                label="用户密码"
                prop="password"
            >
              <el-input
                  v-model="dataMap.formVal.password"
                  placeholder="请输入用户密码"
                  type="password"
              />
            </el-form-item>
          </el-col>
        </el-row>
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

<script setup lang='ts'>
import {listUser, getUser, delUser, addUser, updateUser, patch} from '@/api/system/user'

import {getDeptSelectList} from '@/api/system/dept'
import TreeSelect from '@/components/TreeSelect/Index.vue'
import {listRoles} from '@/api/system/role'
import {Search, Plus, Edit, Refresh, Delete} from '@element-plus/icons'

import {reactive, ref, unref, onMounted, watchEffect, getCurrentInstance} from 'vue'
import {ElMessage, ElMessageBox, ElTree} from 'element-plus'


const treeRef = ref(ElTree)
const queryForm = ref<HTMLInputElement | null>(null)

const dataMap = reactive({
  props: { // 配置项（必选）
    value: 'id',
    label: 'label',
    children: 'children'
  },
  addformFlag: false,
  // 阻止触发switch  change事件
  tigger: false,
  // 遮罩层
  loading: true,
  // 选中数组
  ids: [],
  // 非单个禁用
  single: true,
  // 非多个禁用
  multiple: true,
  // 显示搜索条件
  showSearch: true,
  // 总条数
  total: 0,
  originOptions: [],
  // 用户表格数据
  userList: null,
  // 弹出层标题
  title: '',
  // 部门树选项
  deptOptions: [],
  // 是否显示弹出层
  open: false,
  // 部门名称
  deptName: '',
  // 默认密码
  initPassword: '123456',
  // 日期范围
  dateRange: [],
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
  // 性别状态字典
  sexOptions: [],
  // 角色选项
  roleOptions: [],
  // 表单参数
  formVal: {
    id: undefined,
    deptId: '',
    username: undefined,
    nickname: undefined,
    password: '',
    mobile: undefined,
    email: undefined,
    gender: undefined,
    status: 1,
    remark: undefined,
    postIds: [],
    roleIds: []
  },
  defaultProps: {
    children: 'children',
    label: 'label'
  },
  // 查询参数
  queryParams: {
    page: 1,
    limit: 10,
    keywords: undefined,
    mobile: undefined,
    status: undefined,
    deptId: undefined
  },
  // 列信息
  columns: [
    {key: 0, label: '用户编号', visible: true},
    {key: 1, label: '用户名称', visible: true},
    {key: 2, label: '用户昵称', visible: true},
    {key: 3, label: '部门', visible: true},
    {key: 4, label: '手机号码', visible: true},
    {key: 5, label: '状态', visible: true},
    {key: 6, label: '创建时间', visible: true}
  ],
  // 表单校验
  rules: {
    username: [
      {required: true, message: '用户名不能为空', trigger: 'blur'}
    ],
    password: [
      {required: true, message: '用户密码不能为空', trigger: 'blur'}
    ],
    roleId: [
      {required: true, message: '用户角色不能为空', trigger: 'blur'}
    ],
    deptId: [
      {required: true, message: '归属部门不能为空', trigger: 'blur'}
    ],
    email: [
      {
        type: 'email',
        message: '\'请输入正确的邮箱地址',
        trigger: ['blur', 'change']
      }
    ],
    mobile: [
      {
        pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
        message: '请输入正确的手机号码',
        trigger: 'blur'
      }
    ]
  }
})

/** 查询用户列表 */
function getList() {
  dataMap.loading = true
  dataMap.tigger = true
  listUser(dataMap.queryParams).then(response => {
    const {data, total} = response
    dataMap.userList = data
    dataMap.total = total
    dataMap.loading = false
  })
}

function flatten(origin: any) {
  let result: any = []
  for (let i = 0; i < origin.length; i++) {
    const item = origin[i]
    if (Array.isArray(item.children)) {
      result = result.concat(flatten(item.children))
    } else {
      result.push(item)
    }
  }
  return result
}

/** 查询部门下拉树结构 */
function loadDeptOptions() {
  getDeptSelectList().then(response => {
    dataMap.deptOptions = response.data
    dataMap.originOptions = flatten(response?.data) as any
  })
}

// 筛选节点
function filterNode(value: string, data: any) {
  if (!value) return true
  return data.label.indexOf(value) !== -1
}

// 节点单击事件
function handleNodeClick(data: { [key: string]: any }) {
  dataMap.queryParams.deptId = data.id
  getList()
}

// 用户状态修改
function handleStatusChange(row: { [key: string]: any }) {
  if (dataMap.tigger) {
    const text = row.status === 1 ? '启用' : '停用'
    ElMessageBox.confirm('确认要' + text + ''+ row.username + '用户吗?', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then( () =>{
      return patch(row.id, {status: row.status})
    }).then(() => {
      ElMessage.success(text + '成功')
    }).catch( ()=>{
      row.status = row.status === 1 ? 0 : 1
    })

  }
}

/** 重置密码按钮操作 */
function handleResetPwd(row: { [key: string]: any }) {
  ElMessageBox.prompt('请输入' + row.username + '"的新密码', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputValidator: (value) => {
      if (!value || value.trim().length < 1) {
        return '请填写新密码'
      }
    }
  }).then(({value}) => {
    patch(row.id, {
      status: row.status,
      password: value
    }).then(() => {
      ElMessage.success('修改成功，新密码是：' + value)
    })
  }).catch((err) => {
  })
}


/** 搜索按钮操作 */
function handleQuery() {
  dataMap.queryParams.page = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  (queryForm.value as any).resetFields()
  handleQuery()
}

// 多选框选中数据
function handleSelectionChange(selection: any) {
  dataMap.ids = selection.map((item: any) => item.id)
  dataMap.single = selection.length !== 1
  dataMap.multiple = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  dataMap.addformFlag = true
  dataMap.open = true
  dataMap.title = '添加用户'
  dataMap.formVal.password = "123456"
}

// 表单重置
function resetForm() {
  dataMap.formVal = {
    id: undefined,
    deptId: '',
    username: undefined,
    nickname: undefined,
    password: '',
    mobile: undefined,
    email: undefined,
    gender: undefined,
    status: 1,
    remark: undefined,
    postIds: [],
    roleIds: []
  }
}

/** 修改按钮操作 */
async function handleUpdate(row: { [key: string]: any }) {
  const userId = row.id || dataMap.ids
 const response = await getUser(userId);
  dataMap.formVal = response.data
  dataMap.title = '修改用户'
  dataMap.formVal.password = ''
  dataMap.formVal.deptId =response.data.deptId
  dataMap.open = true
}


/** 提交按钮 */
function submitForm() {
  (queryForm.value as any).validate((valid: any) => {
    if (valid) {
      if (dataMap.formVal.id !== undefined) {
        updateUser(dataMap.formVal.id, dataMap.formVal).then(() => {
          ElMessage.success('修改成功')
          dataMap.open = false
          getList()
        })
      } else {
        addUser(dataMap.formVal).then((response: any) => {
          ElMessage.success('新增成功')
          dataMap.open = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row: { [key: string]: any }) {
  const userIds = row.id || dataMap.ids.join(',')
  ElMessageBox.confirm('是否确认删除用户编号为"' + userIds + '"的数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function () {
    return delUser(userIds)
  }).then(() => {
    getList()
    ElMessage.success('刪除成功')
  }).catch(() =>
      ElMessage.info('已取消删除')
  )
}

// 取消按钮
function cancel() {
  dataMap.tigger = true
  dataMap.open = false
  resetForm()
}


function getDeptId(e: any) {
  dataMap.formVal.deptId = e
}

watchEffect(() => {
  if (dataMap.deptName) {
    const tree = unref(treeRef)
    tree.filter(dataMap.deptName)
  }
})

async function loadRoleOptions() {
  listRoles({}).then(response => {
    dataMap.roleOptions = response.data
  })
}

onMounted(() => {
  getList()
  loadDeptOptions()
  loadRoleOptions()
  const {proxy}: any = getCurrentInstance();
  proxy.$getDictItemsByCode('gender').then((response: any) => {
    dataMap.sexOptions = response?.data
  })
})

function showDialog() {
  loadDeptOptions()
  loadRoleOptions()
}

</script>
<style lang="scss" scoped>
.small-padding {
  .cell {
    padding-left: 5px;
    padding-right: 5px;
  }
}

.fixed-width {
  .el-button--mini {
    padding: 7px 10px;
    width: 60px;
  }
}

</style>
