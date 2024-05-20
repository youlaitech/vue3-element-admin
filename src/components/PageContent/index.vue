<template>
  <el-card shadow="never" class="table-container">
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
            <el-button icon="refresh" circle @click="handleToolbar(item)" />
          </template>
          <!-- 列设置 -->
          <template v-else-if="item === 'filter'">
            <el-popover placement="bottom" trigger="click">
              <template #reference>
                <el-button icon="Operation" circle />
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
          <!-- 搜索 -->
          <template v-else-if="item === 'search'">
            <el-button icon="search" circle @click="handleToolbar(item)" />
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
import { useDateFormat } from "@vueuse/core";
import { hasAuth } from "@/plugins/permission";
import Pagination from "@/components/Pagination/index.vue";
import SvgIcon from "@/components/SvgIcon/index.vue";
import type { TableProps } from "element-plus";

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
  defaultToolbar?: ("refresh" | "filter" | "search")[];
  // table组件列属性(额外的属性templet,operat,slotName)
  cols: Array<{
    type?: "default" | "selection" | "index" | "expand";
    label?: string;
    prop?: string;
    width?: string | number;
    align?: "left" | "center" | "right";
    show?: boolean;
    templet?:
      | "image"
      | "list"
      | "url"
      | "switch"
      | "price"
      | "percent"
      | "icon"
      | "date"
      | "tool"
      | "custom";
    imageWidth?: number;
    imageHeight?: number;
    selectList?: Record<string, any>;
    activeValue?: boolean | string | number;
    inactiveValue?: boolean | string | number;
    activeText?: string;
    inactiveText?: string;
    priceFormat?: string;
    dateFormat?: string;
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
    [key: string]: any;
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
}>();

// 主键
const pk = props.contentConfig.pk ?? "id";
// 表格左侧工具栏
const toolbar = props.contentConfig.toolbar ?? ["add", "delete"];
// 表格右侧工具栏
const defaultToolbar = props.contentConfig.defaultToolbar ?? [
  "refresh",
  "filter",
  "search",
];
// 表格列
const cols = ref(
  props.contentConfig.cols.map((col) => {
    if (col.show === undefined) {
      col.show = true;
    }
    return col;
  })
);
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

// 暴露的属性和方法
defineExpose({ fetchPageData, exportPageData });
</script>

<style lang="scss" scoped></style>
