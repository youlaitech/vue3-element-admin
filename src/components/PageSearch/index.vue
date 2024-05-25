<template>
  <el-card
    shadow="never"
    class="mb-[10px]"
    v-show="visible"
    v-hasPerm="[`${searchConfig.pageName}:query`]"
  >
    <el-form ref="queryFormRef" :model="queryParams" :inline="true">
      <template v-for="(item, index) in formItems" :key="item.prop">
        <el-form-item
          v-show="isExpand ? true : index < showNumber"
          :label="item.label"
          :prop="item.prop"
        >
          <!-- Input 输入框 -->
          <template v-if="item.type === 'input' || item.type === undefined">
            <el-input
              v-model="queryParams[item.prop]"
              v-bind="item.attrs"
              @keyup.enter="handleQuery"
            />
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
        </el-form-item>
      </template>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery">
          搜索
        </el-button>
        <el-button icon="refresh" @click="handleReset">重置</el-button>
        <!-- 展开/收起 -->
        <el-link
          v-if="isExpandable && formItems.length > showNumber"
          class="ml-2"
          type="primary"
          :underline="false"
          @click="isExpand = !isExpand"
        >
          <template v-if="isExpand"> 收起<i-ep-arrow-up /> </template>
          <template v-else> 展开<i-ep-arrow-down /> </template>
        </el-link>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import type { FormInstance } from "element-plus";
import { reactive, ref } from "vue";

// 对象类型
type IObject = Record<string, any>;
// 定义接收的属性
export interface ISearchConfig {
  // 页面名称(参与组成权限标识,如sys:user:xxx)
  pageName: string;
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
    // 初始化数据函数扩展
    initFn?: (formItem: IObject) => void;
  }>;
  // 是否开启展开和收缩
  isExpandable?: boolean;
  // 默认展示的表单项数量
  showNumber?: number;
}

interface IProps {
  searchConfig: ISearchConfig;
}
const props = defineProps<IProps>();
// 自定义事件
const emit = defineEmits<{
  queryClick: [queryParams: IObject];
  resetClick: [queryParams: IObject];
}>();

const queryFormRef = ref<FormInstance>();
// 是否显示
const visible = ref(true);
// 响应式的formItems
const formItems = reactive(props.searchConfig.formItems);
// 是否可展开/收缩
const isExpandable = ref(props.searchConfig.isExpandable ?? true);
// 是否已展开
const isExpand = ref(false);
// 表单项展示数量，若可展开，超出展示数量的表单项隐藏
const showNumber = computed(() => {
  if (isExpandable.value === true) {
    return props.searchConfig.showNumber ?? 3;
  } else {
    return formItems.length;
  }
});
// 搜索表单数据
const queryParams = reactive<IObject>({});
for (const item of formItems) {
  item.initFn && item.initFn(item);
  queryParams[item.prop] = item.initialValue ?? "";
}
// 重置操作
function handleReset() {
  queryFormRef.value?.resetFields();
  emit("resetClick", queryParams);
}
// 查询操作
function handleQuery() {
  emit("queryClick", queryParams);
}
// 获取分页数据
function getQueryParams() {
  return queryParams;
}
// 显示/隐藏 SearchForm
function toggleVisible() {
  visible.value = !visible.value;
}

// 暴露的属性和方法
defineExpose({ getQueryParams, toggleVisible });
</script>

<style lang="scss" scoped></style>
