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

      <el-table-column label="状态" align="center" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.visible === 1" type="success">显示</el-tag>
          <el-tag v-else type="info">隐藏</el-tag>
        </template>
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
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="750px">
      <el-form
        ref="dataFormRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="父级菜单" prop="parentId">
          <tree-select
            v-model="formData.parentId"
            :options="menuOptions"
            placeholder="选择上级菜单"
          />
        </el-form-item>

        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入菜单名称" />
        </el-form-item>

        <el-form-item label="是否外链">
          <el-radio-group v-model="isExternalPath">
            <el-radio :label="false">否</el-radio>
            <el-radio :label="true">是</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="isExternalPath" label="外链地址" prop="path">
          <el-input v-model="formData.path" placeholder="请输入外链完整路径" />
        </el-form-item>

        <el-form-item v-if="!isExternalPath" label="页面路径" prop="component">
          <el-input
            v-model="formData.component"
            placeholder="system/user/index"
            style="width: 95%"
          >
            <template v-if="formData.parentId != 0" #prepend
              >src/views/</template
            >
            <template v-if="formData.parentId != 0" #append>.vue</template>
          </el-input>

          <el-tooltip
            effect="dark"
            content="请输入组件路径，如果是父组件填写 Layout 即可"
            placement="right"
          >
            <i
              class="el-icon-info"
              style="margin-left: 10px; color: darkseagreen"
            ></i>
          </el-tooltip>
        </el-form-item>

        <el-form-item label="图标" prop="icon">
          <el-popover
            placement="bottom-start"
            :width="570"
            trigger="click"
            v-model:visible="iconSelectVisible"
          >
            <icon-select ref="iconSelectRef" @selected="selected" />
            <template #reference>
              <el-input
                v-model="formData.icon"
                placeholder="点击选择图标"
                readonly
                @click="iconSelectVisible = true"
              >
                <template #prefix>
                  <svg-icon
                    :icon-class="formData.icon ? formData.icon : 'color'"
                    class="el-input__icon"
                    style="margin: auto"
                    color="#999"
                  />
                </template>
              </el-input>
            </template>
          </el-popover>
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

        <el-form-item label="跳转路径">
          <el-input
            v-model="formData.redirect"
            placeholder="请输入跳转路径"
            maxlength="50"
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
import { reactive, ref, unref, onMounted, toRefs } from "vue";

import { Search, Plus, Edit, Refresh, Delete } from "@element-plus/icons-vue";
import { ElForm, ElMessage, ElMessageBox } from "element-plus";

import { isExternal } from "@/utils/validate";
import {
  Dialog,
  Option,
  MenuFormData,
  MenuItem,
  MenuQueryParam,
} from "@/types";
// API 依赖
import {
  listTableMenus,
  getMenuFormDetail,
  listSelectMenus,
  addMenu,
  deleteMenus,
  updateMenu,
} from "@/api/system/menu";

import SvgIcon from "@/components/SvgIcon/index.vue";
import TreeSelect from "@/components/TreeSelect/index.vue";
import IconSelect from "@/components/IconSelect/index.vue";

const emit = defineEmits(["menuClick"]);
const iconSelectRef = ref(null);

const queryFormRef = ref(ElForm);
const dataFormRef = ref(ElForm);

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
  total: 0,
  dialog: {visible:false} as Dialog,
  formData: {
    parentId: 0,
    visible: 1,
    sort: 1,
    component: "Layout",
  } as MenuFormData,
  rules: {
    parentId: [{ required: true, message: "请选择顶级菜单", trigger: "blur" }],
    name: [{ required: true, message: "请输入菜单名称", trigger: "blur" }],
    component: [{ required: true, message: "请输入页面路径", trigger: "blur" }],
  },
  menuOptions: [] as Option[],
  currentRow: undefined,
  isExternalPath: false,
  iconSelectVisible: false,
});

const {
  loading,
  single,
  multiple,
  queryParams,
  menuList,
  total,
  dialog,
  formData,
  rules,
  menuOptions,
  isExternalPath,
  iconSelectVisible,
} = toRefs(state);

/**
 * 查询
 */
function handleQuery() {
  // 重置父组件
  emit("menuClick", null);
  state.loading = true;
  listTableMenus(state.queryParams).then(({ data }) => {
    state.menuList = data;
    state.loading = false;
  });
}

/**
 * 加载菜单下拉树
 */
async function loadTreeSelectMenuOptions() {
  const menuOptions: any[] = [];
  await listSelectMenus().then(({ data }) => {
    const menuOption = { value: 0, label: "顶级菜单", children: data };
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

function handleSelectionChange(selection: any) {
  state.ids = selection.map((item: any) => item.id);
  state.single = selection.length !== 1;
  state.multiple = !selection.length;
}

function handleRowClick(row: any) {

  console.log('handleRowClick',row)
  state.currentRow = JSON.parse(JSON.stringify(row));
  emit("menuClick", row);
}

async function handleAdd(row: any) {
  await loadTreeSelectMenuOptions();
  state.dialog = {
    title: "添加菜单",
    visible: true,
  };
  if (row.id) {
    // 行点击新增
    state.formData.parentId = row.id;
    if (row.id == 0) {
      state.formData.component = "Layout";
    } else {
      state.formData.component = "";
    }
  } else {
    if (state.currentRow) {
      // 工具栏新增
      state.formData.parentId = (state.currentRow as any).id;
      state.formData.component = "";
    } else {
      state.formData.parentId = 0;
      state.formData.component = "Layout";
    }
  }
}

async function handleUpdate(row: any) {
  await loadTreeSelectMenuOptions();
  state.dialog = {
    title: "修改菜单",
    visible: true,
  };
  const id = row.id || state.ids;
  getMenuFormDetail(id).then(({ data }) => {
    state.formData = data;
    // 判断是否外部链接
    state.isExternalPath = isExternal(state.formData.path);
  });
}

/**
 * 表单提交
 */
function submitForm() {
  dataFormRef.value.validate((isValid: boolean) => {
    if (isValid) {
      if (state.formData.id) {
        updateMenu(state.formData.id, state.formData).then((response) => {
          ElMessage.success("修改成功");
          state.dialog.visible = false;
          handleQuery();
        });
      } else {
        addMenu(state.formData).then((response) => {
          ElMessage.success("新增成功");
          state.dialog.visible = false;
          handleQuery();
        });
      }
    }
  });
}

function handleDelete(row: any) {
  const ids = [row.id || state.ids].join(",");
  ElMessageBox.confirm("确认删除已选中的数据项?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      deleteMenus(ids).then(() => {
        ElMessage.success("删除成功");
        handleQuery();
      });
    })
    .catch(() => ElMessage.info("已取消删除"));
}

/**
 * 重置表单
 */
function resetForm() {
  state.formData.id = undefined;
  dataFormRef.value.resetFields();
}

/**
 * 取消关闭弹窗
 */
function cancel() {
  state.dialog.visible = false;
  resetForm();
}

/**
 * 显示图标选择下拉
 */
function showIconSelect() {
  state.iconSelectVisible = true;
}

function selected(name: string) {
  state.formData.icon = name;
  state.iconSelectVisible = false;
}

onMounted(() => {
  handleQuery();
});
</script>
