<template>
  <el-card shadow="never" class="table-container">
    <!-- 表格工具栏 -->
    <div class="flex-x-between mb-[10px]">
      <!-- 左侧工具栏 -->
      <div>
        <template v-for="item in contentConfig.toolbar" :key="item">
          <template v-if="typeof item === 'string'">
            <!-- 新增 -->
            <template v-if="item === 'add'">
              <el-button
                v-hasPerm="[`${contentConfig.pageName}:${item}`]"
                type="success"
                icon="plus"
                @click="handleToolbar(item)"
              >
                新增
              </el-button>
            </template>
            <!-- 删除 -->
            <template v-else-if="item === 'delete'">
              <el-button
                v-hasPerm="[`${contentConfig.pageName}:${item}`]"
                type="danger"
                icon="delete"
                :disabled="removeIds.length === 0"
                @click="handleToolbar(item)"
              >
                删除
              </el-button>
            </template>
            <!-- 导出 -->
            <template v-else-if="item === 'export'">
              <el-button
                v-hasPerm="[`${contentConfig.pageName}:${item}`]"
                type="primary"
                icon="download"
                @click="handleToolbar(item)"
              >
                导出
              </el-button>
            </template>
          </template>
          <!-- 其他 -->
          <template v-else-if="typeof item === 'object'">
            <template v-if="item.auth">
              <el-button
                v-hasPerm="[`${contentConfig.pageName}:${item.auth}`]"
                :icon="item.icon"
                type="default"
                @click="handleToolbar(item.name)"
              >
                {{ item.text }}
              </el-button>
            </template>
            <template v-else>
              <el-button
                :icon="item.icon"
                type="default"
                @click="handleToolbar(item.name)"
              >
                {{ item.text }}
              </el-button>
            </template>
          </template>
        </template>
      </div>
      <!-- 右侧工具栏 -->
      <div>
        <template v-for="item in defaultToolbar" :key="item">
          <template v-if="item === 'refresh'">
            <el-icon class="cursor-pointer ml-2" @click="handleToolbar(item)">
              <i-ep-refresh />
            </el-icon>
          </template>

          <template v-else-if="item === 'filter'">
            <!-- 列设置 -->
            <el-popover placement="bottom" trigger="click">
              <template #reference>
                <el-icon class="cursor-pointer ml-2">
                  <i-ep-setting />
                </el-icon>
              </template>

              <el-checkbox
                v-model="columnSetting.checkAll"
                :indeterminate="columnSetting.isIndeterminate"
                @change="handleCheckAllChange"
              >
                全选
              </el-checkbox>

              <el-checkbox-group
                v-model="columnSetting.checkedCols"
                @change="handleCheckedColumnsChange"
              >
                <div v-for="col in contentConfig.cols" :key="col.label">
                  <el-checkbox
                    v-if="col.label"
                    :value="col.label"
                    :label="col.label"
                  />
                </div>
              </el-checkbox-group>
            </el-popover>
          </template>
        </template>
      </div>
    </div>
    <!-- 列表 -->
    <el-table
      v-loading="loading"
      v-bind="contentConfig.table"
      :data="pageData"
      @selection-change="handleSelectionChange"
    >
      <template v-for="col in displayedColumns" :key="col.prop">
        <!-- 显示图片 -->
        <template v-if="col.show && col.templet === 'image'">
          <el-table-column v-bind="col">
            <template #default="scope">
              <template v-if="Array.isArray(scope.row[col.prop])">
                <template
                  v-for="(item, index) in scope.row[col.prop]"
                  :key="item"
                >
                  <el-image
                    :src="item"
                    :preview-src-list="scope.row[col.prop]"
                    :initial-index="index"
                    :preview-teleported="true"
                    :style="`width: ${col.imageWidth ?? 40}px; height: ${col.imageHeight ?? 40}px`"
                  />
                </template>
              </template>
              <template v-else>
                <el-image
                  :src="scope.row[col.prop]"
                  :preview-src-list="[scope.row[col.prop]]"
                  :preview-teleported="true"
                  :style="`width: ${col.imageWidth ?? 40}px; height: ${col.imageHeight ?? 40}px`"
                />
              </template>
            </template>
          </el-table-column>
        </template>
        <!-- 列操作栏 -->
        <template v-else-if="col.show && col.templet === 'tool'">
          <el-table-column v-bind="col">
            <template #default="scope">
              <template v-for="item in col.operat" :key="item">
                <template v-if="typeof item === 'string'">
                  <!-- 编辑/删除 -->
                  <template v-if="item === 'edit' || item === 'delete'">
                    <el-button
                      v-hasPerm="[`${contentConfig.pageName}:${item}`]"
                      :type="item === 'edit' ? 'primary' : 'danger'"
                      :icon="item"
                      size="small"
                      link
                      @click="
                        handleOperat({
                          name: item,
                          row: scope.row,
                          column: scope.column,
                          $index: scope.$index,
                        })
                      "
                    >
                      {{ item === "edit" ? "编辑" : "删除" }}
                    </el-button>
                  </template>
                </template>
                <!-- 其他 -->
                <template v-else-if="typeof item === 'object'">
                  <template v-if="item.auth">
                    <el-button
                      v-hasPerm="[`${contentConfig.pageName}:${item.auth}`]"
                      :icon="item.icon"
                      type="primary"
                      size="small"
                      link
                      @click="
                        handleOperat({
                          name: item.name,
                          row: scope.row,
                          column: scope.column,
                          $index: scope.$index,
                        })
                      "
                    >
                      {{ item.text }}
                    </el-button>
                  </template>
                  <template v-else>
                    <el-button
                      :icon="item.icon"
                      type="primary"
                      size="small"
                      link
                      @click="
                        handleOperat({
                          name: item.name,
                          row: scope.row,
                          column: scope.column,
                          $index: scope.$index,
                        })
                      "
                    >
                      {{ item.text }}
                    </el-button>
                  </template>
                </template>
              </template>
            </template>
          </el-table-column>
        </template>
        <!-- 自定义 -->
        <template v-else-if="col.show && col.templet === 'custom'">
          <el-table-column v-bind="col">
            <template #default="scope">
              <slot
                :name="col.slotName ?? col.prop"
                :prop="col.prop"
                v-bind="scope"
              ></slot>
            </template>
          </el-table-column>
        </template>
        <!-- 其他 -->
        <template v-else>
          <el-table-column v-bind="col" v-if="col.show" />
        </template>
      </template>
    </el-table>
    <!-- 分页 -->
    <pagination
      v-if="total > 0"
      v-model:total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="handlePagination"
    />
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import Pagination from "@/components/Pagination/index.vue";
import type { TableProps, CheckboxValueType } from "element-plus";

// 对象类型
export type IObject = Record<string, any>;
// 定义接收的属性
export interface IOperatData {
  name: string;
  row: any;
  column: any;
  $index: number;
}
export interface IContentConfig<T = any> {
  // 页面名称(参与组成权限标识,如sys:user:xxx)
  pageName: string;
  // table组件属性
  table?: Omit<TableProps<any>, "data">;
  // 列表的网络请求函数(需返回promise)
  indexAction: (queryParams: T) => Promise<any>;
  // 删除的网络请求函数(需返回promise)
  deleteAction?: (ids: string) => Promise<any>;
  // 导出的网络请求函数(需返回promise)
  exportAction?: (queryParams: T) => Promise<any>;
  // 主键名(默认为id)
  pk?: string;
  // 表格工具栏(默认支持add,delete,export,也可自定义)
  toolbar: (
    | "add"
    | "delete"
    | "export"
    | {
        auth?: string;
        icon?: string;
        name: string;
        text: string;
      }
  )[];
  // 表格工具栏右侧图标
  defaultToolbar?: ("refresh" | "filter")[];
  // table组件列属性(额外的属性templet,operat,slotName)
  cols: IObject[];
}
const props = defineProps<{
  contentConfig: IContentConfig;
}>();
// 定义自定义事件
const emit = defineEmits<{
  addClick: [];
  exportClick: [];
  toolbarClick: [name: string];
  editClick: [row: IObject];
  operatClick: [data: IOperatData];
}>();
// 暴露的属性和方法
defineExpose({ fetchPageData, exportPageData });

// 主键
const pk = props.contentConfig.pk ?? "id";
// 表格工具栏右侧图标
const defaultToolbar = props.contentConfig.defaultToolbar ?? [
  "refresh",
  "filter",
];
// 加载状态
const loading = ref(false);
// 删除ID集合 用于批量删除
const removeIds = ref<(number | string)[]>([]);
// 数据总数
const total = ref(0);
// 列表数据
const pageData = ref<IObject[]>([]);
// 每页条数
const pageSize = 10;
// 搜索参数
const queryParams = reactive<IObject>({
  pageNum: 1,
  pageSize: pageSize,
});
// 上一次搜索条件
let lastFormData = {};
// 获取分页数据
function fetchPageData(formData: IObject = {}, isRestart = false) {
  loading.value = true;
  lastFormData = formData;
  if (isRestart) {
    queryParams.pageNum = 1;
    queryParams.pageSize = pageSize;
  }
  props.contentConfig
    .indexAction({ ...queryParams, ...formData })
    .then((data) => {
      total.value = data.total;
      pageData.value = data.list;
    })
    .finally(() => {
      loading.value = false;
    });
}
fetchPageData();

// 行选中
function handleSelectionChange(selection: any[]) {
  removeIds.value = selection.map((item) => item[pk]);
}
// 刷新
function handleRefresh() {
  fetchPageData({}, true);
}
// 删除
function handleDelete(id?: number | string) {
  const ids = [id || removeIds.value].join(",");
  if (!ids) {
    ElMessage.warning("请勾选删除项");
    return;
  }

  ElMessageBox.confirm("确认删除?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(function () {
    if (props.contentConfig.deleteAction) {
      props.contentConfig.deleteAction(ids).then(() => {
        ElMessage.success("删除成功");
        handleRefresh();
      });
    } else {
      ElMessage.error("未配置deleteAction");
    }
  });
}
// 分页
function handlePagination() {
  fetchPageData(lastFormData);
}
// 操作栏
function handleToolbar(name: string) {
  switch (name) {
    case "refresh":
      handleRefresh();
      break;
    case "add":
      emit("addClick");
      break;
    case "delete":
      handleDelete();
      break;
    case "export":
      emit("exportClick");
      break;
    default:
      emit("toolbarClick", name);
      break;
  }
}
// 操作列
function handleOperat(data: IOperatData) {
  switch (data.name) {
    case "edit":
      emit("editClick", data.row);
      break;
    case "delete":
      handleDelete(data.row[pk]);
      break;
    default:
      emit("operatClick", data);
      break;
  }
}
// 导出Excel
function exportPageData(queryParams: IObject = {}) {
  if (props.contentConfig.exportAction) {
    props.contentConfig.exportAction(queryParams).then((response) => {
      const fileData = response.data;
      const fileName = decodeURI(
        response.headers["content-disposition"].split(";")[1].split("=")[1]
      );
      const fileType =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8";

      const blob = new Blob([fileData], { type: fileType });
      const downloadUrl = window.URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.href = downloadUrl;
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      window.URL.revokeObjectURL(downloadUrl);
    });
  } else {
    ElMessage.error("未配置exportAction");
  }
}

// 列设置类型声明
interface IColumnSetting {
  checkAll: boolean;
  isIndeterminate: boolean;
  checkedCols: string[];
}

// 列设置
const columnSetting = ref<IColumnSetting>({
  checkAll: true,
  isIndeterminate: false,
  checkedCols: [],
});
// 创建一个响应式副本，用于存储最后显示的列配置
const displayedColumns = ref<IObject>(props.contentConfig.cols);

// 全选/取消全选
const handleCheckAllChange = (checkAll: CheckboxValueType) => {
  columnSetting.value.checkedCols = checkAll
    ? props.contentConfig.cols.map((col) => col.label)
    : [];
  columnSetting.value.isIndeterminate = false;

  displayedColumns.value = displayedColumns.value.map((col: IObject) => ({
    ...col,
    show: checkAll,
  }));
};

// 选中列变化
const handleCheckedColumnsChange = (values: CheckboxValueType[]) => {
  const showColumnsLength = props.contentConfig.cols.length;

  const checkedCount = values.length;
  columnSetting.value.checkAll = checkedCount === showColumnsLength;
  columnSetting.value.isIndeterminate =
    checkedCount > 0 && checkedCount < showColumnsLength;

  displayedColumns.value = displayedColumns.value.map((col: IObject) => ({
    ...col,
    show: values.includes(col.label),
  }));
};

// 初始化全选状态
handleCheckAllChange(columnSetting.value.checkAll);
</script>

<style lang="scss" scoped></style>
