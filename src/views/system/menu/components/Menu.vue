<template>
  <div class="component-container">
    <!-- 搜索表单 -->
    <el-form ref="queryFormRef" :model="queryParams" :inline="true">
      <el-form-item>
        <el-button type="success" :icon="Plus" @click="handleAdd"
          >新增</el-button
        >
      </el-form-item>

      <el-form-item prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="菜单名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="handleQuery"
          >搜索</el-button
        >
        <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 数据表格 -->
    <el-table
      v-loading="loading"
      :data="menuList"
      highlight-current-row
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      @row-click="handleRowClick"
      row-key="id"
      border
    >
      <el-table-column label="菜单名称">
        <template #default="scope">
          <svg-icon
            color="#333"
            :icon-class="scope.row.icon ? scope.row.icon : 'build'"
          />
          {{ scope.row.name }}
        </template>
      </el-table-column>

      <el-table-column label="菜单类型" align="center" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.type === 'MENU'" type="success">菜单</el-tag>
          <el-tag v-if="scope.row.type === 'CATALOG'" type="warning"
            >目录</el-tag
          >
          <el-tag v-if="scope.row.type === 'EXTLINK'" type="info">外链</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="状态" align="center" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.visible === 1" type="success">显示</el-tag>
          <el-tag v-else type="info">隐藏</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="排序" align="center" width="100" prop="sort">
      </el-table-column>

      <el-table-column label="操作" align="center" width="200">
        <template #default="scope">
          <el-button
            type="success"
            :icon="Plus"
            circle
            plain
            @click.stop="handleAdd(scope.row)"
          />
          <el-button
            type="primary"
            :icon="Edit"
            circle
            plain
            @click.stop="handleUpdate(scope.row)"
          />
          <el-button
            type="danger"
            :icon="Delete"
            circle
            plain
            @click.stop="handleDelete(scope.row)"
          />
        </template>
      </el-table-column>
    </el-table>

    <!-- 弹窗表单 -->
    <el-dialog
      :title="dialog.title"
      v-model="dialog.visible"
      @close="cancel"
      width="750px"
    >
      <el-form
        ref="dataFormRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="父级菜单" prop="parentId">
          <el-tree-select
            v-model="formData.parentId"
            placeholder="选择上级菜单"
            :data="menuOptions"
            filterable
            check-strictly
          />
        </el-form-item>

        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入菜单名称" />
        </el-form-item>

        <el-form-item label="菜单类型">
          <el-radio-group
            v-model="formData.type"
            @change="handleMenuTypeChange"
          >
            <el-radio label="MENU">菜单</el-radio>
            <el-radio label="CATALOG">目录</el-radio>
            <el-radio label="EXTLINK">外链</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 路由路径(浏览器地址栏显示) -->
        <el-form-item
          v-if="formData.type == 'EXTLINK'"
          label="外链地址"
          prop="path"
        >
          <el-input v-model="formData.path" placeholder="请输入外链完整路径" />
        </el-form-item>

        <el-form-item v-else label="路由路径" prop="path">
          <el-input
            v-if="formData.type == 'CATALOG'"
            v-model="formData.path"
            placeholder="/system  (注意:目录以/开头)"
          />
          <el-input v-else v-model="formData.path" placeholder="user" />
        </el-form-item>

        <!-- 组件页面完整路径 -->
        <el-form-item
          v-if="formData.type == 'MENU'"
          label="组件路径"
          prop="component"
        >
          <el-input
            v-model="formData.component"
            placeholder="system/user/index"
            style="width: 95%"
          >
            <template v-if="formData.parentId != '0'" #prepend
              >src/views/</template
            >
            <template v-if="formData.parentId != '0'" #append>.vue</template>
          </el-input>
        </el-form-item>

        <el-form-item label="图标" prop="icon">
          <el-popover
            ref="popoverRef"
            placement="bottom-start"
            :width="570"
            trigger="click"
          >
            <template #reference>
              <el-input
                v-model="formData.icon"
                placeholder="点击选择图标"
                readonly
                @click="iconSelectVisible = true"
              >
                <template #prefix>
                  <svg-icon :icon-class="formData.icon" />
                </template>
              </el-input>
            </template>

            <icon-select @selected="selected" />
          </el-popover>
        </el-form-item>

        <el-form-item label="跳转路由">
          <el-input
            v-model="formData.redirect"
            placeholder="跳转路由路径"
            maxlength="50"
          />
        </el-form-item>

        <el-form-item label="状态">
          <el-radio-group v-model="formData.visible">
            <el-radio :label="1">显示</el-radio>
            <el-radio :label="0">隐藏</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input-number
            v-model="formData.sort"
            style="width: 100px"
            controls-position="right"
            :min="0"
          />
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
import { reactive, ref, onMounted, toRefs } from 'vue';

import { Search, Plus, Edit, Refresh, Delete } from '@element-plus/icons-vue';
import { ElForm, ElMessage, ElMessageBox, ElPopover } from 'element-plus';

import { Dialog, Option } from '@/types/common';

import {
  MenuFormData,
  MenuItem,
  MenuQueryParam,
} from '@/types/api/system/menu';
// API 依赖
import {
  listMenus,
  getMenuDetail,
  listMenuOptions,
  addMenu,
  deleteMenus,
  updateMenu,
} from '@/api/system/menu';

import SvgIcon from '@/components/SvgIcon/index.vue';
import IconSelect from '@/components/IconSelect/index.vue';

const emit = defineEmits(['menuClick']);
const queryFormRef = ref(ElForm);
const dataFormRef = ref(ElForm);
const popoverRef = ref(ElPopover);

const state = reactive({
  loading: true,
  // 选中ID数组
  ids: [],
  // 非单个禁用
  single: true,
  // 非多个禁用
  multiple: true,
  queryParams: {} as MenuQueryParam,
  menuList: [] as MenuItem[],
  dialog: { visible: false } as Dialog,
  formData: {
    parentId: '0',
    name: '',
    visible: 1,
    sort: 1,
    component: undefined,
    type: 'MENU',
  } as MenuFormData,
  rules: {
    parentId: [{ required: true, message: '请选择顶级菜单', trigger: 'blur' }],
    name: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
    type: [{ required: true, message: '请选择菜单类型', trigger: 'blur' }],
    path: [{ required: true, message: '请输入路由路径', trigger: 'blur' }],
    component: [
      { required: true, message: '请输入组件完整路径', trigger: 'blur' },
    ],
  },
  menuOptions: [] as Option[],
  currentRow: undefined,
  // Icon选择器显示状态
  iconSelectVisible: false,
  cacheData: {
    menuType: '',
    menuPath: '',
  },
});

const {
  loading,
  queryParams,
  menuList,
  dialog,
  formData,
  rules,
  menuOptions,
  iconSelectVisible,
  cacheData,
} = toRefs(state);

/**
 * 查询
 */
function handleQuery() {
  // 重置父组件
  emit('menuClick', null);
  state.loading = true;
  listMenus(state.queryParams).then(({ data }) => {
    state.menuList = data;
    state.loading = false;
  });
}

/**
 * 加载菜单下拉树
 */
async function loadMenuData() {
  const menuOptions: any[] = [];
  await listMenuOptions().then(({ data }) => {
    const menuOption = { value: '0', label: '顶级菜单', children: data };
    menuOptions.push(menuOption);
    state.menuOptions = menuOptions;
  });
}

/**
 * 重置查询
 */
function resetQuery() {
  queryFormRef.value.resetFields();
  handleQuery();
}

function handleRowClick(row: any) {
  state.currentRow = JSON.parse(JSON.stringify(row));
  emit('menuClick', row);
}

/**
 * 新增菜单
 * @param row
 */
async function handleAdd(row: any) {
  formData.value.id = undefined;
  await loadMenuData();
  state.dialog = {
    title: '添加菜单',
    visible: true,
  };
  if (row.id) {
    // 行点击新增
    state.formData.parentId = row.id;
    if (row.id == '0') {
      state.formData.type = 'CATALOG';
    } else {
      state.formData.type = 'MENU';
    }
  } else {
    // 工具栏新增
    if (state.currentRow) {
      state.formData.parentId = (state.currentRow as any).id;
      state.formData.type = 'MENU';
    } else {
      state.formData.parentId = '0';
      state.formData.type = 'CATALOG';
    }
  }
}

/**
 * 编辑菜单
 */
async function handleUpdate(row: MenuFormData) {
  await loadMenuData();
  state.dialog = {
    title: '编辑菜单',
    visible: true,
  };
  const id = row.id as string;
  getMenuDetail(id).then(({ data }) => {
    state.formData = data;
    cacheData.value.menuType = data.type;
    cacheData.value.menuPath = data.path;
  });
}

/**
 * 菜单类型 change
 */
function handleMenuTypeChange(menuType: any) {
  if (menuType !== cacheData.value.menuType) {
    formData.value.path = '';
  } else {
    formData.value.path = cacheData.value.menuPath;
  }
}

/**
 * 菜单提交
 */
function submitForm() {
  dataFormRef.value.validate((isValid: boolean) => {
    if (isValid) {
      if (state.formData.id) {
        updateMenu(state.formData.id, state.formData).then(() => {
          ElMessage.success('修改成功');
          cancel();
          handleQuery();
        });
      } else {
        addMenu(state.formData).then(() => {
          ElMessage.success('新增成功');
          cancel();
          handleQuery();
        });
      }
    }
  });
}

/**
 * 删除菜单
 *
 * @param row
 */
function handleDelete(row: any) {
  const ids = [row.id || state.ids].join(',');
  ElMessageBox.confirm('确认删除已选中的数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      deleteMenus(ids).then(() => {
        ElMessage.success('删除成功');
        handleQuery();
      });
    })
    .catch(() => ElMessage.info('已取消删除'));
}

/**
 * 取消关闭弹窗
 */
function cancel() {
  dataFormRef.value.resetFields();
  state.dialog.visible = false;
}

/**
 * 选择图标后事件
 */
function selected(name: string) {
  state.formData.icon = name;
  state.iconSelectVisible = false;
}

onMounted(() => {
  handleQuery();
});
</script>
