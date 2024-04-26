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
        <el-button type="primary" @click="handleQuery">
          <i-ep-search />搜索
        </el-button>
        <el-button @click="handleReset"><i-ep-refresh />重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import type { ElForm } from "element-plus";

// 定义接收的属性/自定义事件
interface IProps {
  searchConfig: {
    pageName: string;
    formItems: Array<{
      type: string;
      label: string;
      prop: string;
      attrs?: any;
      initialValue?: any;
      options?: { label: string; value: any }[];
    }>;
  };
}
const props = defineProps<IProps>();
const emit = defineEmits<{
  queryClick: [queryParams: any];
  resetClick: [queryParams: any];
}>();
// 暴露的属性和方法
defineExpose({ getQueryParams });

const queryFormRef = ref<InstanceType<typeof ElForm>>();
// 定义form的数据
const queryParams = reactive<any>({});
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
