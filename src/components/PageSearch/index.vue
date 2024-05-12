<template>
  <div class="search-container" v-hasPerm="[`${searchConfig.pageName}:query`]">
    <el-form ref="queryFormRef" :model="queryParams">
      <el-row :gutter="20">
        <template
          v-if="isExpand || searchConfig.formItems.length <= showNumber"
        >
          <el-col
            v-bind="colSpans"
            v-for="item in searchConfig.formItems"
            :key="item.prop"
          >
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
          </el-col>
        </template>

        <template v-else>
          <el-col
            v-bind="colSpans"
            v-for="item in searchConfig.formItems.slice(0, showNumber)"
            :key="item.prop"
          >
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
          </el-col>
        </template>

        <div class="flex flex-auto items-start justify-end pr-5">
          <el-form-item>
            <el-button type="primary" icon="search" @click="handleQuery">
              搜索
            </el-button>
            <el-button icon="refresh" @click="handleReset">重置</el-button>

            <el-link
              v-if="isExpandable && searchConfig.formItems.length > showNumber"
              @click="isExpand = !isExpand"
              class="ml-2"
              type="primary"
              :underline="false"
            >
              {{ isExpand ? "收起" : "展开" }}
              <i-ep-arrow-up v-if="isExpand" />
              <i-ep-arrow-down v-else />
            </el-link>
          </el-form-item>
        </div>
      </el-row>
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
  // 是否开启展开和收缩
  isExpandable?: boolean;
  // 默认展示的表单项数量
  showNumber?: number;
}
interface IProps {
  searchConfig: ISearchConfig;
}
const props = defineProps<IProps>();

// 是否可展开/收缩
const isExpandable = ref(props.searchConfig.isExpandable);
// 是否展开
const isExpand = ref(false);

// 表单项展示数量，若可展开，超出展示数量的表单项隐藏
const showNumber = computed(() => {
  if (isExpandable.value === true) {
    return props.searchConfig.showNumber ?? 3;
  } else {
    return props.searchConfig.formItems.length;
  }
});
// 表单项栅格列数配置
const colSpans = {
  xs: 24,
  sm: 12,
  md: 8,
  lg: 6,
  xl: 4,
};

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
