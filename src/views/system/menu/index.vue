<template>
  <div class="app-container">
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="关键字" prop="keywords">
          <el-input
            v-model="queryParams.keywords"
            placeholder="菜单名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery"
            ><template #icon><i-ep-search /></template>搜索</el-button
          >
          <el-button @click="handleResetQuery">
            <template #icon><i-ep-refresh /></template>
            重置</el-button
          >
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="never" class="table-container">
      <template #header>
        <el-button
          v-hasPerm="['sys:menu:add']"
          type="success"
          @click="handleDialogOpen(0)"
        >
          <template #icon><i-ep-plus /></template>
          新增</el-button
        >
      </template>

      <el-table
        v-loading="loading"
        :data="menuTableData"
        highlight-current-row
        row-key="id"
        :expand-row-keys="['1']"
        @row-click="handleRowClick"
        :tree-props="{
          children: 'children',
          hasChildren: 'hasChildren',
        }"
      >
        <el-table-column label="菜单名称" min-width="200">
          <template #default="scope">
            <template
              v-if="scope.row.icon && scope.row.icon.startsWith('el-icon')"
            >
              <el-icon style="vertical-align: -0.15em">
                <component :is="scope.row.icon.replace('el-icon-', '')" />
              </el-icon>
            </template>
            <template v-else-if="scope.row.icon">
              <svg-icon :icon-class="scope.row.icon" />
            </template>
            <template v-else>
              <svg-icon icon-class="menu" />
            </template>
            {{ scope.row.name }}
          </template>
        </el-table-column>

        <el-table-column label="类型" align="center" width="80">
          <template #default="scope">
            <el-tag
              v-if="scope.row.type === MenuTypeEnum.CATALOG"
              type="warning"
              >目录</el-tag
            >
            <el-tag v-if="scope.row.type === MenuTypeEnum.MENU" type="success"
              >菜单</el-tag
            >
            <el-tag v-if="scope.row.type === MenuTypeEnum.BUTTON" type="danger"
              >按钮</el-tag
            >
            <el-tag v-if="scope.row.type === MenuTypeEnum.EXTLINK" type="info"
              >外链</el-tag
            >
          </template>
        </el-table-column>

        <el-table-column
          label="路由路径"
          align="left"
          width="150"
          prop="path"
        />

        <el-table-column
          label="组件路径"
          align="left"
          width="250"
          prop="component"
        />

        <el-table-column
          label="权限标识"
          align="center"
          width="200"
          prop="perm"
        />

        <el-table-column label="状态" align="center" width="80">
          <template #default="scope">
            <el-tag v-if="scope.row.visible === 1" type="success">显示</el-tag>
            <el-tag v-else type="info">隐藏</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="排序" align="center" width="80" prop="sort" />

        <el-table-column fixed="right" align="center" label="操作" width="220">
          <template #default="scope">
            <el-button
              v-if="scope.row.type == 'CATALOG' || scope.row.type == 'MENU'"
              v-hasPerm="['sys:menu:add']"
              type="primary"
              link
              size="small"
              @click.stop="handleDialogOpen(scope.row.id)"
            >
              <i-ep-plus />新增
            </el-button>

            <el-button
              v-hasPerm="['sys:menu:edit']"
              type="primary"
              link
              size="small"
              @click.stop="handleDialogOpen(undefined, scope.row.id)"
            >
              <i-ep-edit />编辑
            </el-button>
            <el-button
              v-hasPerm="['sys:menu:delete']"
              type="danger"
              link
              size="small"
              @click.stop="handleDelete(scope.row.id)"
              ><i-ep-delete />
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      destroy-on-close
      append-to-body
      width="1000px"
      @close="closeDialog"
    >
      <el-form
        ref="menuFormRef"
        :model="formData"
        :rules="rules"
        label-width="160px"
      >
        <el-form-item label="父级菜单" prop="parentId">
          <el-tree-select
            v-model="formData.parentId"
            placeholder="选择上级菜单"
            :data="menuOptions"
            filterable
            check-strictly
            :render-after-expand="false"
          />
        </el-form-item>

        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入菜单名称" />
        </el-form-item>

        <el-form-item label="菜单类型" prop="type">
          <el-radio-group
            v-model="formData.type"
            @change="handleMenuTypeChange"
          >
            <el-radio value="CATALOG">目录</el-radio>
            <el-radio value="MENU">菜单</el-radio>
            <el-radio value="BUTTON">按钮</el-radio>
            <el-radio value="EXTLINK">外链</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          v-if="formData.type == 'EXTLINK'"
          label="外链地址"
          prop="path"
        >
          <el-input v-model="formData.path" placeholder="请输入外链完整路径" />
        </el-form-item>

        <el-form-item
          v-if="
            formData.type == MenuTypeEnum.CATALOG ||
            formData.type == MenuTypeEnum.MENU
          "
          label=""
          prop="path"
        >
          <template #label>
            <div>
              路由路径
              <el-tooltip placement="bottom" effect="light">
                <template #content>
                  定义应用中不同页面对应的 URL 路径，目录需以 /
                  开头，菜单项不用。例如：系统管理目录
                  /system，系统管理下的用户管理菜单 user。
                </template>
                <i-ep-QuestionFilled class="inline-block" />
              </el-tooltip>
            </div>
          </template>
          <el-input
            v-if="formData.type == MenuTypeEnum.CATALOG"
            v-model="formData.path"
            placeholder="system"
          />
          <el-input v-else v-model="formData.path" placeholder="user" />
        </el-form-item>

        <el-form-item
          v-if="formData.type == MenuTypeEnum.MENU"
          prop="component"
        >
          <template #label>
            <div>
              组件路径
              <el-tooltip placement="bottom" effect="light">
                <template #content>
                  组件页面完整路径，相对于 src/views/，如
                  system/user/index，缺省后缀 .vue
                </template>
                <i-ep-QuestionFilled class="inline-block" />
              </el-tooltip>
            </div>
          </template>

          <el-input
            v-model="formData.component"
            placeholder="system/user/index"
            style="width: 95%"
          >
            <template v-if="formData.type == MenuTypeEnum.MENU" #prepend
              >src/views/</template
            >
            <template v-if="formData.type == MenuTypeEnum.MENU" #append
              >.vue</template
            >
          </el-input>
        </el-form-item>

        <el-form-item v-if="formData.type == MenuTypeEnum.MENU">
          <template #label>
            <div>
              路由参数
              <el-tooltip placement="bottom" effect="light">
                <template #content>
                  组件页面使用 `useRoute().query.参数名` 获取路由参数值。
                </template>
                <i-ep-QuestionFilled class="inline-block" />
              </el-tooltip>
            </div>
          </template>

          <div v-if="!formData.params || formData.params.length === 0">
            <el-button
              type="success"
              plain
              @click="formData.params = [{ key: '', value: '' }]"
              >添加路由参数</el-button
            >
          </div>

          <div v-else>
            <div v-for="(item, index) in formData.params" :key="index">
              <el-input
                v-model="item.key"
                placeholder="参数名"
                class="w-[100px]"
              />

              <span class="mx-1">=</span>

              <el-input
                v-model="item.value"
                placeholder="参数值"
                class="w-[100px]"
              />

              <el-icon
                class="ml-2 cursor-pointer color-[var(--el-color-success)]"
                style="vertical-align: -0.15em"
                v-if="
                  formData.params.indexOf(item) === formData.params.length - 1
                "
                @click="formData.params.push({ key: '', value: '' })"
              >
                <CirclePlusFilled />
              </el-icon>
              <el-icon
                class="ml-2 cursor-pointer color-[var(--el-color-danger)]"
                style="vertical-align: -0.15em"
                @click="
                  formData.params.splice(formData.params.indexOf(item), 1)
                "
              >
                <DeleteFilled />
              </el-icon>
            </div>
          </div>
        </el-form-item>

        <el-form-item
          v-if="formData.type !== MenuTypeEnum.BUTTON"
          prop="visible"
          label="显示状态"
        >
          <el-radio-group v-model="formData.visible">
            <el-radio :value="1">显示</el-radio>
            <el-radio :value="0">隐藏</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          v-if="
            formData.type === MenuTypeEnum.CATALOG ||
            formData.type === MenuTypeEnum.MENU
          "
        >
          <template #label>
            <div>
              始终显示
              <el-tooltip placement="bottom" effect="light">
                <template #content>
                  选择“是”，即使目录或菜单下只有一个子节点，也会显示父节点。<br />
                  选择“否”，如果目录或菜单下只有一个子节点，则只显示该子节点，隐藏父节点。<br />
                  如果是叶子节点，请选择“否”。
                </template>
                <i-ep-QuestionFilled class="inline-block" />
              </el-tooltip>
            </div>
          </template>

          <el-radio-group v-model="formData.alwaysShow">
            <el-radio :value="1">是</el-radio>
            <el-radio :value="0">否</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          v-if="formData.type === MenuTypeEnum.MENU"
          label="页面缓存"
        >
          <el-radio-group v-model="formData.keepAlive">
            <el-radio :value="1">开启</el-radio>
            <el-radio :value="0">关闭</el-radio>
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

        <!-- 权限标识 -->
        <el-form-item
          v-if="formData.type == MenuTypeEnum.BUTTON"
          label="权限标识"
          prop="perm"
        >
          <el-input v-model="formData.perm" placeholder="sys:user:add" />
        </el-form-item>

        <el-form-item
          v-if="formData.type !== MenuTypeEnum.BUTTON"
          label="图标"
          prop="icon"
        >
          <!-- 图标选择器 -->
          <icon-select v-model="formData.icon" />
        </el-form-item>

        <el-form-item
          v-if="formData.type == MenuTypeEnum.CATALOG"
          label="跳转路由"
        >
          <el-input v-model="formData.redirect" placeholder="跳转路由" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="closeDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "Menu",
  inheritAttrs: false,
});

import MenuAPI from "@/api/menu";
import { MenuQuery, MenuForm, MenuVO } from "@/api/menu/model";
import { MenuTypeEnum } from "@/enums/MenuTypeEnum";

const queryFormRef = ref(ElForm);
const menuFormRef = ref(ElForm);

const loading = ref(false);
const dialog = reactive({
  title: "新增菜单",
  visible: false,
});

// 查询参数
const queryParams = reactive<MenuQuery>({});
// 菜单表格数据
const menuTableData = ref<MenuVO[]>([]);
// 顶级菜单下拉选项
const menuOptions = ref<OptionType[]>([]);

// 初始菜单表单数据
const initialMenuFormData = ref<MenuForm>({
  id: undefined,
  parentId: 0,
  visible: 1,
  sort: 1,
  type: MenuTypeEnum.MENU, // 默认菜单
  alwaysShow: 0,
  keepAlive: 1,
  params: [],
});

// 菜单表单数据
const formData = ref({ ...initialMenuFormData.value });

// 表单验证规则
const rules = reactive({
  parentId: [{ required: true, message: "请选择顶级菜单", trigger: "blur" }],
  name: [{ required: true, message: "请输入菜单名称", trigger: "blur" }],
  type: [{ required: true, message: "请选择菜单类型", trigger: "blur" }],
  path: [{ required: true, message: "请输入路由路径", trigger: "blur" }],
  component: [{ required: true, message: "请输入组件路径", trigger: "blur" }],
  visible: [{ required: true, message: "请输入路由路径", trigger: "blur" }],
});

// 选择表格的行菜单ID
const selectedMenuId = ref<number | undefined>();

// 查询
function handleQuery() {
  loading.value = true;
  MenuAPI.getList(queryParams)
    .then((data) => {
      menuTableData.value = data;
    })
    .finally(() => {
      loading.value = false;
    });
}

// 重置查询
function handleResetQuery() {
  queryFormRef.value.resetFields();
  handleQuery();
}

// 行点击事件
function handleRowClick(row: MenuVO) {
  // 记录表格选择的菜单ID，新增子菜单作为父菜单ID
  selectedMenuId.value = row.id;
}

/**
 * 打开表单弹窗
 *
 * @param parentId 父菜单ID
 * @param menuId 菜单ID
 */
function handleDialogOpen(parentId?: number, menuId?: number) {
  MenuAPI.getOptions()
    .then((data) => {
      menuOptions.value = [{ value: 0, label: "顶级菜单", children: data }];
    })
    .then(() => {
      dialog.visible = true;
      if (menuId) {
        dialog.title = "编辑菜单";
        MenuAPI.getFormData(menuId).then((data) => {
          initialMenuFormData.value = { ...data };
          formData.value = data;
        });
      } else {
        dialog.title = "新增菜单";
        formData.value.parentId = parentId;
      }
    });
}

// 菜单类型切换
function handleMenuTypeChange() {
  // 如果菜单类型改变
  if (formData.value.type !== initialMenuFormData.value.type) {
    if (formData.value.type === MenuTypeEnum.MENU) {
      // 目录切换到菜单时，清空组件路径
      if (initialMenuFormData.value.type === MenuTypeEnum.CATALOG) {
        formData.value.component = "";
      } else {
        // 其他情况，保留原有的组件路径
        formData.value.path = initialMenuFormData.value.path;
        formData.value.component = initialMenuFormData.value.component;
      }
    }
  }
}

/** 菜单保存提交 */
function submitForm() {
  menuFormRef.value.validate((isValid: boolean) => {
    if (isValid) {
      const menuId = formData.value.id;
      if (menuId) {
        MenuAPI.update(menuId, formData.value).then(() => {
          ElMessage.success("修改成功");
          closeDialog();
          handleQuery();
        });
      } else {
        MenuAPI.add(formData.value).then(() => {
          ElMessage.success("新增成功");
          closeDialog();
          handleQuery();
        });
      }
    }
  });
}

// 删除菜单
function handleDelete(menuId: number) {
  if (!menuId) {
    ElMessage.warning("请勾选删除项");
    return false;
  }

  ElMessageBox.confirm("确认删除已选中的数据项?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      MenuAPI.deleteById(menuId).then(() => {
        ElMessage.success("删除成功");
        handleQuery();
      });
    })
    .catch(() => ElMessage.info("已取消删除"));
}

// 关闭弹窗
function closeDialog() {
  dialog.visible = false;
  menuFormRef.value.resetFields();
  menuFormRef.value.clearValidate();
  formData.value.id = undefined;
}

onMounted(() => {
  handleQuery();
});
</script>
