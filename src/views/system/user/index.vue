<script lang="ts">
export default {
  name: 'user'
};
</script>

<script setup lang="ts">
// Vue依赖
import {
  reactive,
  ref,
  watchEffect,
  onMounted,
  getCurrentInstance,
  toRefs
} from 'vue';

// 导入API
import {
  listUserPages,
  getUserDetail,
  deleteUsers,
  addUser,
  updateUser,
  updateUserStatus,
  updateUserPassword,
  downloadTemplate,
  exportUser,
  importUser
} from '@/api/system/user';
import { listSelectDepartments } from '@/api/system/dept';
import { listRoleOptions } from '@/api/system/role';

// 组件依赖
import {
  ElMessage,
  ElMessageBox,
  ElTree,
  ElForm,
  UploadFile
} from 'element-plus';
import {
  Search,
  Plus,
  Edit,
  Refresh,
  Delete,
  Lock,
  Download,
  Top,
  UploadFilled
} from '@element-plus/icons-vue';
import {
  UserItem,
  UserQueryParam,
  UserFormData,
  UserImportFormData
} from '@/types/api/system/user';

import { Option, Dialog } from '@/types/common';

// DOM元素的引用声明定义 ，变量名和DOM的ref属性值一致
const deptTreeRef = ref(ElTree); // 部门树
const queryFormRef = ref(ElForm); // 查询表单
const dataFormRef = ref(ElForm); // 用户表单
const importFormRef = ref(ElForm); // 导入表单

const { proxy }: any = getCurrentInstance();

const state = reactive({
  // 遮罩层
  loading: true,
  // 选中数组
  ids: [],
  // 非单个禁用
  single: true,
  // 非多个禁用
  multiple: true,
  // 总条数
  total: 0,
  // 用户分页数据
  userList: [] as UserItem[],
  // 弹窗属性
  dialog: {
    visible: false
  } as Dialog,
  deptName: undefined,
  // 部门树选项
  deptOptions: [] as Option[],
  // 部门名称
  // 性别状态字典
  genderOptions: [] as any[],
  // 角色选项
  roleOptions: [] as Option[],
  // 表单参数
  formData: {
    status: 1
  } as UserFormData,
  // 查询参数
  queryParams: {
    pageNum: 1,
    pageSize: 10
  } as UserQueryParam,
  // 表单校验
  rules: {
    username: [{ required: true, message: '用户名不能为空', trigger: 'blur' }],
    nickname: [
      { required: true, message: '用户昵称不能为空', trigger: 'blur' }
    ],
    deptId: [{ required: true, message: '所属部门不能为空', trigger: 'blur' }],
    roleIds: [{ required: true, message: '用户角色不能为空', trigger: 'blur' }],
    email: [
      {
        pattern: /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/,
        message: '请输入正确的邮箱地址',
        trigger: 'blur'
      }
    ],
    mobile: [
      {
        pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
        message: '请输入正确的手机号码',
        trigger: 'blur'
      }
    ]
  },

  importDialog: {
    title: '用户搭配',
    visible: false
  } as Dialog,
  importFormData: {} as UserImportFormData,
  excelFile: undefined as any,
  excelFilelist: [] as File[]
});

const {
  loading,
  multiple,
  queryParams,
  userList,
  total,
  dialog,
  formData,
  rules,
  deptName,
  deptOptions,
  roleOptions,
  importDialog,
  importFormData,
  excelFilelist
} = toRefs(state);

/**
 * 部门筛选
 */
watchEffect(
  () => {
    deptTreeRef.value.filter(state.deptName);
  },
  {
    flush: 'post' // watchEffect会在DOM挂载或者更新之前就会触发，此属性控制在DOM元素更新后运行
  }
);

/**
 * 部门列表筛选
 */
function filterDeptNode(value: string, data: any) {
  if (!value) {
    return true;
  }
  return data.label.indexOf(value) !== -1;
}

/**
 * 部门树节点click
 */
function handleDeptNodeClick(data: { [key: string]: any }) {
  state.queryParams.deptId = data.value;
  handleQuery();
}

/**
 * 加载角色下拉列表
 */
async function loadRoleOptions() {
  listRoleOptions().then(response => {
    state.roleOptions = response.data;
  });
}

/**
 * 用户状态修改
 */
function handleStatusChange(row: { [key: string]: any }) {
  const text = row.status === 1 ? '启用' : '停用';
  ElMessageBox.confirm(
    '确认要' + text + '' + row.username + '用户吗?',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      return updateUserStatus(row.id, row.status);
    })
    .then(() => {
      ElMessage.success(text + '成功');
    })
    .catch(() => {
      row.status = row.status === 1 ? 0 : 1;
    });
}

/**
 * 用户查询
 **/
function handleQuery() {
  state.loading = true;
  listUserPages(state.queryParams).then(({ data }) => {
    state.userList = data.list;
    state.total = data.total;
    state.loading = false;
  });
}

/**
 * 重置查询
 */
function resetQuery() {
  queryFormRef.value.resetFields();
  handleQuery();
}

/**
 * 表格行选中事件
 */
function handleSelectionChange(selection: any) {
  state.ids = selection.map((item: any) => item.id);
  state.single = selection.length !== 1;
  state.multiple = !selection.length;
}

/**
 * 密码重置
 */
function resetPassword(row: { [key: string]: any }) {
  ElMessageBox.prompt(
    '请输入用户「' + row.username + '」的新密码',
    '重置密码',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    }
  )
    .then(({ value }) => {
      if (!value) {
        ElMessage.warning('请输入新密码');
        return false;
      }
      updateUserPassword(row.id, value).then(() => {
        ElMessage.success('密码重置成功，新密码是：' + value);
      });
    })
    .catch(() => {});
}

/**
 * 添加用户
 **/
async function handleAdd() {
  state.dialog = {
    title: '添加用户',
    visible: true
  };
  await loadDeptOptions();
  await loadRoleOptions();
}

/**
 * 修改用户
 **/
async function handleUpdate(row: { [key: string]: any }) {
  state.dialog = {
    title: '修改用户',
    visible: true
  };

  const userId = row.id || state.ids;
  await loadDeptOptions();
  await loadRoleOptions();
  getUserDetail(userId).then(({ data }) => {
    formData.value = data;
  });
}

/**
 * 表单提交
 */
function submitForm() {
  dataFormRef.value.validate((valid: any) => {
    if (valid) {
      const userId = state.formData.id;
      if (userId) {
        updateUser(userId, state.formData).then(() => {
          ElMessage.success('修改用户成功');
          cancel();
          handleQuery();
        });
      } else {
        addUser(state.formData).then(() => {
          ElMessage.success('新增用户成功');
          cancel();
          handleQuery();
        });
      }
    }
  });
}

/**
 * 删除用户
 */
function handleDelete(row: { [key: string]: any }) {
  const userIds = row.id || state.ids.join(',');
  ElMessageBox.confirm(
    '是否确认删除用户编号为「' + userIds + '」的数据项?',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(function () {
      deleteUsers(userIds).then(() => {
        ElMessage.success('删除成功');
        handleQuery();
      });
    })
    .catch(() => ElMessage.info('已取消删除'));
}

/**
 * 取消
 */
function cancel() {
  dialog.value.visible = false;
  formData.value.id = undefined;
  dataFormRef.value.resetFields();
  dataFormRef.value.clearValidate();
}

/**
 * 加载部门
 */
async function loadDeptOptions() {
  listSelectDepartments().then(response => {
    state.deptOptions = response.data;
  });
}

/**
 * 加载性别字典
 */
function loadGenderOptions() {
  proxy.$getDictItemsByTypeCode('gender').then((response: any) => {
    state.genderOptions = response?.data;
  });
}

/**
 * 下载导入模板
 */
function handleDownloadTemplate() {
  downloadTemplate().then((response: any) => {
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8'
    });
    const a = document.createElement('a');
    const href = window.URL.createObjectURL(blob); // 下载链接
    a.href = href;
    a.download = decodeURI(
      response.headers['content-disposition'].split(';')[1].split('=')[1]
    ); // 获取后台设置的文件名称
    document.body.appendChild(a);
    a.click(); // 点击下载
    document.body.removeChild(a); // 下载完成移除元素
    window.URL.revokeObjectURL(href); // 释放掉blob对象
  });
}

/**
 * 显示导入弹窗
 */
async function showImportDialog() {
  await loadDeptOptions();
  await loadRoleOptions();
  importDialog.value.visible = true;
}

/**
 * Excel文件change事件
 *
 * @param file
 */
function handleExcelChange(file: UploadFile) {
  if (!/\.(xlsx|xls|XLSX|XLS)$/.test(file.name)) {
    ElMessage.warning('上传Excel只能为xlsx、xls格式');
    state.excelFile = undefined;
    state.excelFilelist = [];
    return false;
  }
  state.excelFile = file.raw;
}

/**
 * Excel文件上传
 */
function submitImportForm() {
  importFormRef.value.validate((valid: any) => {
    if (valid) {
      if (!state.excelFile) {
        ElMessage.warning('上传Excel文件不能为空');
        return false;
      }

      const deptId = state.importFormData.deptId;
      const roleIds = state.importFormData.roleIds.join(',');
      importUser(deptId, roleIds, state.excelFile).then(response => {
        ElMessage.success(response.data);
        closeImportDialog();
        handleQuery();
      });
    }
  });
}

/**
 * 关闭导入弹窗
 */
function closeImportDialog() {
  state.importDialog.visible = false;
  state.excelFile = undefined;
  state.excelFilelist = [];
  importFormRef.value.resetFields();
}

/**
 * 导出用户
 */
function handleExport() {
  exportUser(queryParams.value).then((response: any) => {
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8'
    });
    const a = document.createElement('a');
    const href = window.URL.createObjectURL(blob); // 下载的链接
    a.href = href;
    a.download = decodeURI(
      response.headers['content-disposition'].split(';')[1].split('=')[1]
    ); // 获取后台设置的文件名称
    document.body.appendChild(a);
    a.click(); // 点击导出
    document.body.removeChild(a); // 下载完成移除元素
    window.URL.revokeObjectURL(href); // 释放掉blob对象
  });
}

/**
 * 初始化数据
 */
function loadData() {
  // 初始化性别字典
  loadGenderOptions();
  // 初始化部门
  loadDeptOptions();
  // 初始化用户列表数据
  handleQuery();
}

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!-- 部门树 -->
      <el-col :span="4" :xs="24">
        <el-card class="box-card">
          <el-input
            v-model="deptName"
            placeholder="部门名称"
            clearable
            :prefix-icon="Search"
            style="margin-bottom: 20px"
          />
          <el-tree
            ref="deptTreeRef"
            :data="deptOptions"
            :props="{ children: 'children', label: 'label', disabled: '' }"
            :expand-on-click-node="false"
            :filter-node-method="filterDeptNode"
            default-expand-all
            @node-click="handleDeptNodeClick"
          ></el-tree>
        </el-card>
      </el-col>

      <!-- 用户数据 -->
      <el-col :span="20" :xs="24">
        <el-card class="box-card">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-row>
              <el-col :span="18" :xs="24">
                <el-form-item>
                  <el-button
                    type="success"
                    :icon="Plus"
                    @click="handleAdd"
                    v-hasPerm="['sys:user:add']"
                    >新增</el-button
                  >
                  <el-button
                    type="danger"
                    :icon="Delete"
                    :disabled="multiple"
                    @click="handleDelete"
                    v-hasPerm="['sys:user:delete']"
                    >删除</el-button
                  >
                </el-form-item>

                <el-form-item prop="keywords">
                  <el-input
                    v-model="queryParams.keywords"
                    placeholder="用户名/昵称/手机号"
                    clearable
                    style="width: 200px"
                    @keyup.enter="handleQuery"
                  />
                </el-form-item>

                <el-form-item prop="status">
                  <el-select
                    v-model="queryParams.status"
                    placeholder="用户状态"
                    clearable
                    style="width: 200px"
                  >
                    <el-option label="正常" value="1" />
                    <el-option label="禁用" value="0" />
                  </el-select>
                </el-form-item>

                <el-form-item>
                  <el-button type="primary" :icon="Search" @click="handleQuery"
                    >搜索</el-button
                  >
                  <el-button :icon="Refresh" @click="resetQuery"
                    >重置</el-button
                  >
                </el-form-item>
              </el-col>

              <el-col :span="6" :xs="24" style="text-align: right">
                <el-form-item>
                  <el-dropdown split-button style="margin-left: 12px">
                    导入
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item
                          :icon="Download"
                          @click="handleDownloadTemplate"
                          >下载模板</el-dropdown-item
                        >
                        <el-dropdown-item :icon="Top" @click="showImportDialog"
                          >导入数据</el-dropdown-item
                        >
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                  <el-button
                    :icon="Download"
                    style="margin-left: 12px"
                    @click="handleExport"
                    >导出</el-button
                  >
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>

          <el-table
            v-loading="loading"
            :data="userList"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="50" align="center" />
            <el-table-column
              key="id"
              label="用户编号"
              align="center"
              prop="id"
            />
            <el-table-column
              key="username"
              label="用户名"
              align="center"
              prop="username"
            />
            <el-table-column label="用户昵称" align="center" prop="nickname" />

            <el-table-column label="性别" align="center" prop="genderLabel" />

            <el-table-column label="部门" align="center" prop="deptName" />
            <el-table-column
              label="手机号码"
              align="center"
              prop="mobile"
              width="120"
            />

            <el-table-column label="状态" align="center" prop="status">
              <template #default="scope">
                <el-switch
                  v-model="scope.row.status"
                  :inactive-value="0"
                  :active-value="1"
                  @change="handleStatusChange(scope.row)"
                />
              </template>
            </el-table-column>
            <el-table-column
              label="创建时间"
              align="center"
              prop="createTime"
              width="180"
            ></el-table-column>
            <el-table-column label="操作" align="center" width="150">
              <template #default="scope">
                <el-button
                  type="primary"
                  :icon="Edit"
                  circle
                  plain
                  @click="handleUpdate(scope.row)"
                  v-hasPerm="['sys:user:edit']"
                ></el-button>
                <el-button
                  type="danger"
                  :icon="Delete"
                  circle
                  plain
                  @click="handleDelete(scope.row)"
                  v-hasPerm="['sys:user:delete']"
                ></el-button>
                <el-button
                  type="warning"
                  :icon="Lock"
                  circle
                  plain
                  @click="resetPassword(scope.row)"
                ></el-button>
              </template>
            </el-table-column>
          </el-table>

          <pagination
            v-if="total > 0"
            :total="total"
            v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize"
            @pagination="handleQuery"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- 用户表单 -->
    <el-dialog
      :title="dialog.title"
      v-model="dialog.visible"
      width="600px"
      append-to-body
      @close="cancel"
    >
      <el-form
        ref="dataFormRef"
        :model="formData"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            :readonly="!!formData.id"
            v-model="formData.username"
            placeholder="请输入用户名"
          />
        </el-form-item>

        <el-form-item label="用户昵称" prop="nickname">
          <el-input v-model="formData.nickname" placeholder="请输入用户昵称" />
        </el-form-item>

        <el-form-item label="所属部门" prop="deptId">
          <el-tree-select
            v-model="formData.deptId"
            placeholder="请选择所属部门"
            :data="deptOptions"
            filterable
            check-strictly
            :render-after-expand="false"
          />
        </el-form-item>

        <el-form-item label="手机号码" prop="mobile">
          <el-input
            v-model="formData.mobile"
            placeholder="请输入手机号码"
            maxlength="11"
          />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="formData.email"
            placeholder="请输入邮箱"
            maxlength="50"
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="用户性别" prop="gender">
          <el-select v-model="formData.gender" placeholder="请选择">
            <el-option label="未知" :value="0" />
            <el-option label="男" :value="1" />
            <el-option label="女" :value="2" />
          </el-select>
        </el-form-item>

        <el-form-item label="角色" prop="roleIds">
          <el-select v-model="formData.roleIds" multiple placeholder="请选择">
            <el-option
              v-for="item in roleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!--用户导入弹窗-->
    <el-dialog
      :title="importDialog.title"
      v-model="importDialog.visible"
      width="600px"
      append-to-body
      @close="closeImportDialog"
    >
      <el-form
        ref="importFormRef"
        :model="importFormData"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="部门" prop="deptId">
          <el-tree-select
            v-model="importFormData.deptId"
            placeholder="请选择部门"
            :data="deptOptions"
            filterable
            check-strictly
          />
        </el-form-item>

        <el-form-item label="角色" prop="roleIds">
          <el-select
            v-model="importFormData.roleIds"
            multiple
            placeholder="请选择"
          >
            <el-option
              v-for="item in roleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Excel">
          <el-upload
            class="upload-demo"
            action=""
            drag
            :auto-upload="false"
            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            :file-list="excelFilelist"
            :on-change="handleExcelChange"
            :limit="1"
          >
            <el-icon class="el-icon--upload">
              <upload-filled />
            </el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或
              <em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">xls/xlsx files</div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitImportForm">确 定</el-button>
          <el-button @click="closeImportDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped></style>
