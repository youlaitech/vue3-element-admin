<template>
  <el-card shadow="never">
    <!-- 表格工具栏 -->
    <div class="flex-x-between mb-[10px]">
      <!-- 左侧工具栏 -->
      <div>
        <template v-for="item in toolbar" :key="item">
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
            <el-button
              v-hasPerm="[`${contentConfig.pageName}:${item.auth}`]"
              :icon="item.icon"
              type="default"
              @click="handleToolbar(item.name)"
            >
              {{ item.text }}
            </el-button>
          </template>
        </template>
      </div>
      <!-- 右侧工具栏 -->
      <div>
        <template v-for="item in defaultToolbar" :key="item">
          <!-- 刷新 -->
          <template v-if="item === 'refresh'">
            <el-button
              icon="refresh"
              circle
              title="刷新"
              @click="handleToolbar(item)"
            />
          </template>
          <!-- 筛选列 -->
          <template v-else-if="item === 'filter'">
            <el-popover placement="bottom" trigger="click">
              <template #reference>
                <el-button icon="Operation" circle title="筛选列" />
              </template>
              <el-scrollbar max-height="350px">
                <template v-for="col in cols" :key="col">
                  <el-checkbox
                    v-if="col.prop"
                    v-model="col.show"
                    :label="col.label"
                  />
                </template>
              </el-scrollbar>
            </el-popover>
          </template>
          <!-- 导出 -->
          <template v-else-if="item === 'exports'">
            <el-button
              icon="FolderOpened"
              circle
              title="导出"
              @click="handleToolbar(item)"
            />
          </template>
          <!-- 搜索 -->
          <template v-else-if="item === 'search'">
            <el-button
              icon="search"
              circle
              title="搜索"
              @click="handleToolbar(item)"
            />
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
      @filter-change="handleFilterChange"
    >
      <template v-for="col in cols" :key="col">
        <el-table-column v-if="col.show" v-bind="col">
          <template #default="scope">
            <!-- 显示图片 -->
            <template v-if="col.templet === 'image'">
              <template v-if="col.prop">
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
            </template>
            <!-- 根据行的selectList属性返回对应列表值 -->
            <template v-else-if="col.templet === 'list'">
              <template v-if="col.prop">
                {{ (col.selectList ?? {})[scope.row[col.prop]] }}
              </template>
            </template>
            <!-- 格式化显示链接 -->
            <template v-else-if="col.templet === 'url'">
              <template v-if="col.prop">
                <el-link
                  type="primary"
                  :href="scope.row[col.prop]"
                  target="_blank"
                >
                  {{ scope.row[col.prop] }}
                </el-link>
              </template>
            </template>
            <!-- 生成开关组件 -->
            <template v-else-if="col.templet === 'switch'">
              <template v-if="col.prop">
                <!-- pageData.length>0: 解决el-switch组件会在表格初始化的时候触发一次change事件 -->
                <el-switch
                  v-model="scope.row[col.prop]"
                  :active-value="col.activeValue ?? 1"
                  :inactive-value="col.inactiveValue ?? 0"
                  :inline-prompt="true"
                  :active-text="col.activeText ?? ''"
                  :inactive-text="col.inactiveText ?? ''"
                  :validate-event="false"
                  :disabled="!hasAuth(`${contentConfig.pageName}:modify`)"
                  @change="
                    pageData.length > 0 &&
                      handleModify(col.prop, scope.row[col.prop], scope.row)
                  "
                />
              </template>
            </template>
            <!-- 生成输入框组件 -->
            <template v-else-if="col.templet === 'input'">
              <template v-if="col.prop">
                <el-input
                  v-model="scope.row[col.prop]"
                  :type="col.inputType ?? 'text'"
                  :disabled="!hasAuth(`${contentConfig.pageName}:modify`)"
                  @blur="handleModify(col.prop, scope.row[col.prop], scope.row)"
                />
              </template>
            </template>
            <!-- 格式化为价格 -->
            <template v-else-if="col.templet === 'price'">
              <template v-if="col.prop">
                {{ `${col.priceFormat ?? "￥"}${scope.row[col.prop]}` }}
              </template>
            </template>
            <!-- 格式化为百分比 -->
            <template v-else-if="col.templet === 'percent'">
              <template v-if="col.prop"> {{ scope.row[col.prop] }}% </template>
            </template>
            <!-- 显示图标 -->
            <template v-else-if="col.templet === 'icon'">
              <template v-if="col.prop">
                <template v-if="scope.row[col.prop].startsWith('el-icon-')">
                  <el-icon>
                    <component
                      :is="scope.row[col.prop].replace('el-icon-', '')"
                    />
                  </el-icon>
                </template>
                <template v-else>
                  <svg-icon :icon-class="scope.row[col.prop]" />
                </template>
              </template>
            </template>
            <!-- 格式化时间 -->
            <template v-else-if="col.templet === 'date'">
              <template v-if="col.prop">
                {{
                  useDateFormat(
                    scope.row[col.prop],
                    col.dateFormat ?? "YYYY-MM-DD HH:mm:ss"
                  ).value
                }}
              </template>
            </template>
            <!-- 列操作栏 -->
            <template v-else-if="col.templet === 'tool'">
              <template
                v-for="item in col.operat ?? ['edit', 'delete']"
                :key="item"
              >
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
              </template>
            </template>
            <!-- 自定义 -->
            <template v-else-if="col.templet === 'custom'">
              <slot
                :name="col.slotName ?? col.prop"
                :prop="col.prop"
                v-bind="scope"
              ></slot>
            </template>
          </template>
        </el-table-column>
      </template>
    </el-table>
    <!-- 分页 -->
    <template v-if="showPagination">
      <el-scrollbar>
        <div class="mt-[12px]">
          <el-pagination
            v-bind="pagination"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-scrollbar>
    </template>
  </el-card>
</template>

<script setup lang="ts">
import ExcelJS from "exceljs";
import { ref, reactive } from "vue";
import { useDateFormat } from "@vueuse/core";
import { hasAuth } from "@/plugins/permission";
import SvgIcon from "@/components/SvgIcon/index.vue";
import type { TableProps, PaginationProps } from "element-plus";

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
  // pagination组件属性
  pagination?:
    | boolean
    | Partial<
        Omit<
          PaginationProps,
          "v-model:page-size" | "v-model:current-page" | "total" | "currentPage"
        >
      >;
  // 列表的网络请求函数(需返回promise)
  indexAction: (queryParams: T) => Promise<any>;
  // 默认的分页相关的请求参数
  request?: {
    pageName: string;
    limitName: string;
  };
  // 数据格式解析的回调函数
  parseData?: (res: any) => {
    total: number;
    list: IObject[];
    [key: string]: any;
  };
  // 删除的网络请求函数(需返回promise)
  deleteAction?: (ids: string) => Promise<any>;
  // 导出的网络请求函数(需返回promise)
  exportAction?: (queryParams: T) => Promise<any>;
  // 修改属性的网络请求函数(需返回promise)
  modifyAction?: (data: {
    [key: string]: any;
    field: string;
    value: boolean | string | number;
  }) => Promise<any>;
  // 主键名(默认为id)
  pk?: string;
  // 表格工具栏(默认支持add,delete,export,也可自定义)
  toolbar?: Array<
    | "add"
    | "delete"
    | "export"
    | {
        auth: string;
        icon?: string;
        name: string;
        text: string;
      }
  >;
  // 表格工具栏右侧图标
  defaultToolbar?: ("refresh" | "filter" | "exports" | "search")[];
  // table组件列属性(额外的属性templet,operat,slotName)
  cols: Array<{
    type?: "default" | "selection" | "index" | "expand";
    label?: string;
    prop?: string;
    width?: string | number;
    align?: "left" | "center" | "right";
    // 列是否显示
    show?: boolean;
    // 模板
    templet?:
      | "image"
      | "list"
      | "url"
      | "switch"
      | "input"
      | "price"
      | "percent"
      | "icon"
      | "date"
      | "tool"
      | "custom";
    // image模板相关参数
    imageWidth?: number;
    imageHeight?: number;
    // list模板相关参数
    selectList?: Record<string, any>;
    // switch模板相关参数
    activeValue?: boolean | string | number;
    inactiveValue?: boolean | string | number;
    activeText?: string;
    inactiveText?: string;
    // input模板相关参数
    inputType?: string;
    // price模板相关参数
    priceFormat?: string;
    // date模板相关参数
    dateFormat?: string;
    // tool模板相关参数
    operat?: Array<
      | "edit"
      | "delete"
      | {
          auth: string;
          icon?: string;
          name: string;
          text: string;
        }
    >;
    // filter值拼接符
    filterJoin?: string;
    [key: string]: any;
    // 初始化数据函数
    initFn?: (item: IObject) => void;
  }>;
}
const props = defineProps<{
  contentConfig: IContentConfig;
}>();
// 定义自定义事件
const emit = defineEmits<{
  addClick: [];
  exportClick: [];
  searchClick: [];
  toolbarClick: [name: string];
  editClick: [row: IObject];
  operatClick: [data: IOperatData];
  filterChange: [data: IObject];
}>();

// 主键
const pk = props.contentConfig.pk ?? "id";
// 表格左侧工具栏
const toolbar = props.contentConfig.toolbar ?? ["add", "delete"];
// 表格右侧工具栏
const defaultToolbar = props.contentConfig.defaultToolbar ?? [
  "refresh",
  "filter",
  "exports",
  "search",
];
// 表格列
const cols = ref(
  props.contentConfig.cols.map((col) => {
    col.initFn && col.initFn(col);
    if (col.show === undefined) {
      col.show = true;
    }
    if (
      col.prop !== undefined &&
      col.columnKey === undefined &&
      col["column-key"] === undefined
    ) {
      col.columnKey = col.prop;
    }
    return col;
  })
);
// 加载状态
const loading = ref(false);
// 删除ID集合 用于批量删除
const removeIds = ref<(number | string)[]>([]);
// 列表数据
const pageData = ref<IObject[]>([]);
// 显示分页
const showPagination = props.contentConfig.pagination !== false;
// 分页配置
const defalutPagination = {
  background: true,
  layout: "total, sizes, prev, pager, next, jumper",
  pageSize: 20,
  pageSizes: [10, 20, 30, 50],
  total: 0,
  currentPage: 1,
};
const pagination = reactive(
  typeof props.contentConfig.pagination === "object"
    ? { ...defalutPagination, ...props.contentConfig.pagination }
    : defalutPagination
);
// 分页相关的请求参数
const request = props.contentConfig.request ?? {
  pageName: "pageNum",
  limitName: "pageSize",
};

// 行选中
function handleSelectionChange(selection: any[]) {
  removeIds.value = selection.map((item) => item[pk]);
}
// 刷新
function handleRefresh() {
  fetchPageData(lastFormData);
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
        fetchPageData({}, true);
      });
    } else {
      ElMessage.error("未配置deleteAction");
    }
  });
}
// 导出
function handleExports() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("sheet");
  const columns: Partial<ExcelJS.Column>[] = [];
  cols.value.forEach((col) => {
    if (col.label && col.prop) {
      columns.push({ header: col.label, key: col.prop });
    }
  });
  worksheet.columns = columns;
  worksheet.addRows(pageData.value);
  workbook.xlsx
    .writeBuffer()
    .then((buffer) => {
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.href = downloadUrl;
      downloadLink.download = props.contentConfig.pageName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      window.URL.revokeObjectURL(downloadUrl);
    })
    .catch((error) => console.log("Error writing excel export", error));
}
// 操作栏
function handleToolbar(name: string) {
  switch (name) {
    case "refresh":
      handleRefresh();
      break;
    case "exports":
      handleExports();
      break;
    case "search":
      emit("searchClick");
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
// 属性修改
function handleModify(
  field: string,
  value: boolean | string | number,
  row: Record<string, any>
) {
  if (props.contentConfig.modifyAction) {
    props.contentConfig.modifyAction({
      [pk]: row[pk],
      field: field,
      value: value,
    });
  } else {
    ElMessage.error("未配置modifyAction");
  }
}
// 分页切换
function handleSizeChange(value: number) {
  pagination.pageSize = value;
  fetchPageData(lastFormData);
}
function handleCurrentChange(value: number) {
  pagination.currentPage = value;
  fetchPageData(lastFormData);
}
// 远程数据筛选
let filterParams: IObject = {};
function handleFilterChange(newFilters: any) {
  const filters: IObject = {};
  for (const key in newFilters) {
    const col = cols.value.find((col) => {
      return col.columnKey === key || col["column-key"] === key;
    });
    if (col && col.filterJoin !== undefined) {
      filters[key] = newFilters[key].join(col.filterJoin);
    } else {
      filters[key] = newFilters[key];
    }
  }
  filterParams = { ...filterParams, ...filters };
  emit("filterChange", filterParams);
}

// 获取涮选条件
function getFilterParams() {
  return filterParams;
}
// 获取分页数据
let lastFormData = {};
function fetchPageData(formData: IObject = {}, isRestart = false) {
  loading.value = true;
  // 上一次搜索条件
  lastFormData = formData;
  // 重置页码
  if (isRestart) {
    pagination.currentPage = 1;
  }
  props.contentConfig
    .indexAction(
      showPagination
        ? {
            [request.pageName]: pagination.currentPage,
            [request.limitName]: pagination.pageSize,
            ...formData,
          }
        : formData
    )
    .then((data) => {
      if (showPagination) {
        if (props.contentConfig.parseData) {
          data = props.contentConfig.parseData(data);
        }
        pagination.total = data.total;
        pageData.value = data.list;
      } else {
        pageData.value = data;
      }
    })
    .finally(() => {
      loading.value = false;
    });
}
fetchPageData();
// 导出Excel
function exportPageData(formData: IObject = {}) {
  if (props.contentConfig.exportAction) {
    props.contentConfig.exportAction(formData).then((response) => {
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

// 暴露的属性和方法
defineExpose({ fetchPageData, exportPageData, getFilterParams });
</script>

<style lang="scss" scoped></style>
