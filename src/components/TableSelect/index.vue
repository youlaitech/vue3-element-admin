<template>
  <div ref="tableSelectRef">
    <el-popover
      :visible="popoverVisible"
      width="75%"
      placement="bottom-end"
      v-bind="selectConfig.popover"
      @show="handleShow"
    >
      <template #reference>
        <el-button @click="popoverVisible = !popoverVisible">
          <slot>选择列表</slot>
        </el-button>
      </template>
      <!-- 弹出框内容 -->
      <div ref="popoverContentRef">
        <!-- 表单 -->
        <el-form ref="formRef" :model="queryParams" :inline="true">
          <template v-for="item in selectConfig.formItems" :key="item.prop">
            <el-form-item :label="item.label" :prop="item.prop">
              <!-- Input 输入框 -->
              <template v-if="item.type === 'input'">
                <template v-if="item.attrs?.type === 'number'">
                  <el-input
                    v-model.number="queryParams[item.prop]"
                    v-bind="item.attrs"
                    @keyup.enter="handleQuery"
                  />
                </template>
                <template v-else>
                  <el-input
                    v-model="queryParams[item.prop]"
                    v-bind="item.attrs"
                    @keyup.enter="handleQuery"
                  />
                </template>
              </template>
              <!-- Select 选择器 -->
              <template v-else-if="item.type === 'select'">
                <el-select v-model="queryParams[item.prop]" v-bind="item.attrs">
                  <template v-for="option in item.options" :key="option.value">
                    <el-option :label="option.label" :value="option.value" />
                  </template>
                </el-select>
              </template>
              <!-- TreeSelect 树形选择 -->
              <template v-else-if="item.type === 'tree-select'">
                <el-tree-select
                  v-model="queryParams[item.prop]"
                  v-bind="item.attrs"
                />
              </template>
              <!-- DatePicker 日期选择器 -->
              <template v-else-if="item.type === 'date-picker'">
                <el-date-picker
                  v-model="queryParams[item.prop]"
                  v-bind="item.attrs"
                />
              </template>
              <!-- Input 输入框 -->
              <template v-else>
                <template v-if="item.attrs?.type === 'number'">
                  <el-input
                    v-model.number="queryParams[item.prop]"
                    v-bind="item.attrs"
                    @keyup.enter="handleQuery"
                  />
                </template>
                <template v-else>
                  <el-input
                    v-model="queryParams[item.prop]"
                    v-bind="item.attrs"
                    @keyup.enter="handleQuery"
                  />
                </template>
              </template>
            </el-form-item>
          </template>
          <el-form-item>
            <el-button type="primary" icon="search" @click="handleQuery">
              搜索
            </el-button>
            <el-button icon="refresh" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
        <!-- 列表 -->
        <el-table
          ref="tableRef"
          v-loading="loading"
          :data="pageData"
          :border="true"
          :max-height="315"
          :row-key="pk"
          :class="{ radio: !selectConfig.multiple }"
          @select="handleSelect"
        >
          <template v-for="col in selectConfig.tableColumns" :key="col.prop">
            <!-- 自定义 -->
            <template v-if="col.templet === 'custom'">
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
              <el-table-column v-bind="col" />
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
        <div class="feedback">
          <el-button type="primary" size="small" @click="handleConfirm">
            确 定
          </el-button>
          <el-button size="small" @click="handleClear"> 清 空 </el-button>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script lang="ts" setup>
import type { TableInstance, FormInstance, PopoverProps } from "element-plus";

// 对象类型
export type IObject = Record<string, any>;
// 定义接收的属性
export interface ISelectConfig<T = any> {
  // popover组件属性
  popover?: Partial<Omit<PopoverProps, "visible" | "v-model:visible">>;
  // 列表的网络请求函数(需返回promise)
  indexAction: (queryParams: T) => Promise<any>;
  // 主键名(跨页选择必填,默认为id)
  pk?: string;
  // 多选
  multiple?: boolean;
  // 表单项
  formItems: Array<{
    // 组件类型(如input,select等)
    type?: "input" | "select" | "tree-select" | "date-picker";
    // 标签文本
    label: string;
    // 键名
    prop: string;
    // 组件属性
    attrs?: IObject;
    // 初始值
    initialValue?: any;
    // 可选项(适用于select组件)
    options?: { label: string; value: any }[];
  }>;
  // 列选项
  tableColumns: Array<{
    type?: "default" | "selection" | "index" | "expand";
    label?: string;
    prop?: string;
    width?: string | number;
    [key: string]: any;
  }>;
}
const props = defineProps<{
  selectConfig: ISelectConfig;
}>();

// 自定义事件
const emit = defineEmits<{
  confirmClick: [selection: any[]];
}>();

// 主键
const pk = props.selectConfig.pk ?? "id";
// 是否显示弹出框
const popoverVisible = ref(false);
// 加载状态
const loading = ref(false);
// 数据总数
const total = ref(0);
// 列表数据
const pageData = ref<IObject[]>([]);
// 每页条数
const pageSize = 10;
// 搜索参数
const queryParams = reactive<{
  pageNum: number;
  pageSize: number;
  [key: string]: any;
}>({
  pageNum: 1,
  pageSize: pageSize,
});

// 表单操作
const formRef = ref<FormInstance>();
// 初始化搜索条件
for (const item of props.selectConfig.formItems) {
  queryParams[item.prop] = item.initialValue ?? "";
}
// 重置操作
function handleReset() {
  formRef.value?.resetFields();
  fetchPageData(true);
}
// 查询操作
function handleQuery() {
  fetchPageData(true);
}

// 获取分页数据
function fetchPageData(isRestart = false) {
  loading.value = true;
  if (isRestart) {
    queryParams.pageNum = 1;
    queryParams.pageSize = pageSize;
  }
  props.selectConfig
    .indexAction(queryParams)
    .then((data) => {
      total.value = data.total;
      pageData.value = data.list;
    })
    .finally(() => {
      loading.value = false;
    });
}

// 列表操作
const tableRef = ref<TableInstance>();
// 数据刷新后是否保留选项
for (const item of props.selectConfig.tableColumns) {
  if (item.type === "selection") {
    item.reserveSelection = true;
    break;
  }
}
// 选择
let selectedItems: IObject[] = [];
function handleSelect(selection: any[], row: any) {
  if (props.selectConfig.multiple || selection.length === 0) {
    // 多选
    selectedItems = selection;
  } else {
    // 单选
    selectedItems = [selection[selection.length - 1]];
    tableRef.value?.clearSelection();
    tableRef.value?.toggleRowSelection(selectedItems[0], true);
  }
}
// 分页
function handlePagination() {
  fetchPageData();
}

// 弹出框
const isInit = ref(false);
// 显示
function handleShow() {
  if (isInit.value === false) {
    isInit.value = true;
    fetchPageData();
  }
}
// 确定
function handleConfirm() {
  popoverVisible.value = false;
  emit("confirmClick", selectedItems);
}
// 清空
function handleClear() {
  tableRef.value?.clearSelection();
  selectedItems = [];
}
// 关闭
const tableSelectRef = ref();
const popoverContentRef = ref();
/* onClickOutside(tableSelectRef, () => (popoverVisible.value = false), {
  ignore: [popoverContentRef],
}); */
</script>

<style scoped lang="scss">
.feedback {
  display: flex;
  justify-content: flex-end;
  margin-top: 6px;
}
// 隐藏全选按钮
.radio :deep(.el-table__header th.el-table__cell:nth-child(1) .el-checkbox) {
  visibility: hidden;
}
</style>
