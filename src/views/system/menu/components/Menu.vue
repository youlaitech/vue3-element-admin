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
        <el-button type="success" :icon="Plus" @click="handleAdd">新增</el-button>
      </el-form-item>

      <el-form-item>
        <el-input
            v-model="state.queryParams.name"
            placeholder="菜单名称"
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
        v-loading="state.loading"
        :data="state.menuList"
        row-key="id"
        highlight-current-row
        :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
        @row-click="handleRowClick"
        border
        size="mini"
    >
      <el-table-column label="菜单名称">
        <template #default="scope">
          <svg-icon color='#333' :icon-class="scope.row.icon?scope.row.icon:'build'"/>
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="130">
        <template #default="scope">
          <el-button
              type="success"
              :icon="Plus"
              size="mini"
              circle
              plain
              @click.stop="handleAdd(scope.row)"
          />
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

    <!-- 弹窗表单 -->
    <el-dialog
        :title="state.dialog.title"
        v-model="state.dialog.visible"
        width="800px"
    >
      <el-form
          ref="dataForm"
          :model="state.formData"
          :rules="state.rules"
          label-width="80px">
        <el-form-item label="父级菜单" prop="parentId">
          <tree-select
              v-model:value="state.formData.parentId"
              :options="state.menuOptions"
              placeholder="选择上级菜单"
          />
        </el-form-item>

        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="state.formData.name" placeholder="请输入菜单名称"/>
        </el-form-item>

        <el-form-item label="页面路径" prop="component">
          <el-input
              v-model="state.formData.component"
              :readonly="state.formData.parentId==0?true:false"
              placeholder="system/user/index"
              style="width: 95%"
          >
            <template v-if="state.formData.parentId!=0" #prepend>src/views/</template>
            <template v-if="state.formData.parentId!=0" #append>.vue</template>
          </el-input>

          <el-tooltip effect="dark"
                      content="请输入页面路径，如果是父级菜单请填写 Layout 即可"
                      placement="right">
            <i class="el-icon-info" style="margin-left: 10px;color:darkseagreen"></i>
          </el-tooltip>
        </el-form-item>

        <el-form-item label="菜单图标">

          <el-popover
              placement="bottom-start"
              :width="540"
              v-model:visible="showChooseIcon"
              trigger="click"
              @show="showSelectIcon"
          >
            <icon-select ref="iconSelectRef" @selected="selected"/>
            <template #reference>
              <el-input v-model="state.formData.icon" placeholder="点击选择图标" readonly>
                <template #prefix>
                  <svg-icon
                      v-if="state.formData.icon"
                      :icon-class="state.formData.icon"
                      class="el-input__icon"
                      style="height: 40px;width: 16px;"
                      color="#999"
                  />
                  <i v-else class="el-icon-search el-input__icon"/>
                </template>
              </el-input>
            </template>
          </el-popover>
        </el-form-item>

        <el-form-item label="状态">
          <el-radio-group v-model="state.formData.visible">
            <el-radio :label="1">显示</el-radio>
            <el-radio :label="0">隐藏</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="state.formData.sort" style="width: 100px" controls-position="right" :min="0"/>
        </el-form-item>

        <el-form-item label="跳转路径">
          <el-input v-model="state.formData.redirect" placeholder="请输入跳转路径" maxlength="50"/>
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
import {listTableMenus, getMenuDetail, listTreeSelectMenus, addMenu, deleteMenus, updateMenu} from "@/api/system/menu";
import {Search, Plus, Edit, Refresh, Delete} from '@element-plus/icons'
import {ElForm, ElMessage, ElMessageBox} from "element-plus";
import {defineEmits, reactive, ref, unref, onMounted} from "vue";
import SvgIcon from '@/components/SvgIcon/index.vue';
import TreeSelect from '@/components/TreeSelect/index.vue';
import IconSelect from '@/components/IconSelect/index.vue';

const emit = defineEmits(['menuClick'])
const showChooseIcon = ref(false);
const iconSelectRef = ref(null);
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
  menuList: [],
  total: 0,
  dialog: {
    title: '',
    visible: false
  },
  formData: {
    id: undefined,
    parentId: 0,
    name: undefined,
    visible: 1,
    icon: '',
    sort: 1,
    component: 'Layout',
    path: undefined
  },
  rules: {
    parentId: [
      {required: true, message: '请选择顶级菜单', trigger: 'blur'}
    ],
    name: [
      {required: true, message: '请输入菜单名称', trigger: 'blur'}
    ],
    component: [
      {required: true, message: '请输入页面路径', trigger: 'blur'}
    ]
  },
  menuOptions: [] as any[],
  currentRow: undefined
})

function handleQuery() {
  // 重置父组件
  emit('menuClick', null)
  state.loading = true
  listTableMenus(state.queryParams).then(response => {
    const {data, total} = response as any
    state.menuList = data
    state.total = total
    state.loading = false
  })
}

/**
 * 加载菜单下拉树
 */
async function loadTreeSelectMenuOptions() {
  const menuOptions: any[] = []
  await listTreeSelectMenus().then(response => {
    const menuOption = {id: 0, label: '顶级菜单', children: response.data}
    menuOptions.push(menuOption)
    state.menuOptions = menuOptions
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
  state.currentRow = JSON.parse(JSON.stringify(row))
  emit('menuClick', row)
}

async function handleAdd(row: any) {
  resetForm()
  await loadTreeSelectMenuOptions()
  state.dialog = {
    title: '添加菜单',
    visible: true,
  }
  if (row.id) {
    // 行点击新增
    state.formData.parentId = row.id
    if (row.id == 0) {
      state.formData.component = 'Layout'
    } else {
      state.formData.component = ''
    }

  } else {
    if (state.currentRow) {
      // 工具栏新增
      state.formData.parentId = (state.currentRow as any).id
      state.formData.component = ''
    } else {
      state.formData.parentId = 0
      state.formData.component = 'Layout'
    }
  }
}

async function handleUpdate(row: any) {
  resetForm()
  await loadTreeSelectMenuOptions()
  state.dialog = {
    title: '修改菜单',
    visible: true
  }
  const id = row.id || state.ids
  getMenuDetail(id).then(response => {
    state.formData = response.data
  })
}

const dataForm = ref(ElForm)

function submitForm() {
  const form = unref(dataForm)
  form.validate((valid: any) => {
    if (valid) {
      if (state.formData.id) {
        updateMenu(state.formData.id, state.formData).then(response => {
          ElMessage.success('修改成功')
          state.dialog.visible = false
          handleQuery()
        })
      } else {
        addMenu(state.formData).then(response => {
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
    parentId: 0,
    name: undefined,
    visible: 1,
    icon: '',
    sort: 1,
    component: 'Layout',
    path: undefined
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
    deleteMenus(ids).then(() => {
      ElMessage.success('删除成功')
      handleQuery()
    })
  }).catch(() =>
      ElMessage.info('已取消删除')
  )
}

function showSelectIcon() {
  (iconSelectRef as any).value.reset();
  showChooseIcon.value = true;
}

function selected(name: string) {
  state.formData.icon = name;
  showChooseIcon.value = false;
}

onMounted(() => {
  handleQuery()
})
</script>

<style scoped>

</style>
