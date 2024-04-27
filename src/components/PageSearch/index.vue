<template>
  <div class="search-container" v-hasPerm="[`${searchConfig.pageName}:query`]">
    <el-form ref="queryFormRef" :model="queryParams" :inline="true">
      <template v-for="item in searchConfig.formItems" :key="item.prop">
        <el-form-item :label="item.label" :prop="item.prop">
          <!-- Select 选择器 -->
          <template v-if="item.type === 'select'">
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
            <el-input
              v-model="queryParams[item.prop]"
              v-bind="item.attrs"
              @keyup.enter="handleQuery"
            />
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import type { ElForm } from "element-plus";

// 对象类型
type IObject = Record<string, any>;
// 定义接收的属性
export interface ISearchConfig {
  // 页面名称(参与组成权限标识,如sys:user:xxx)
  pageName: string;
  // 表单项
  formItems: Array<{
    // 组件类型(如input,select等)
    type: string;
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
// 暴露的属性和方法
defineExpose({ getQueryParams });

const queryFormRef = ref<InstanceType<typeof ElForm>>();
// 搜索表单数据
const queryParams = reactive<IObject>({});
for (const item of props.searchConfig.formItems) {
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
</script>

<style lang="scss" scoped>
.search-container {
  padding: 18px 0 0 10px;
  margin-bottom: 10px;
  background-color: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  box-shadow: var(--el-box-shadow-light);
}
</style>
