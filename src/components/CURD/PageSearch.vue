<template>
  <div v-show="visible">
    <el-card v-bind="cardAttrs">
      <el-form ref="queryFormRef" :model="queryParams" v-bind="formAttrs" :class="isGrid">
        <template v-for="(item, index) in formItems" :key="item.prop">
          <el-form-item
            v-show="isExpand ? true : index < showNumber"
            :label="item?.label"
            :prop="item.prop"
          >
            <!-- Label -->
            <template #label>
              <span class="flex-y-center">
                {{ item?.label || "" }}
                <el-tooltip v-if="item?.tips" v-bind="getTooltipProps(item.tips)">
                  <QuestionFilled class="w-4 h-4 mx-1" />
                </el-tooltip>
                <span v-if="searchConfig.colon" class="ml-0.5">:</span>
              </span>
            </template>

            <el-cascader
              v-if="item.type === 'cascader'"
              v-model.trim="queryParams[item.prop]"
              v-bind="{ style: { width: '100%' }, ...item.attrs }"
              v-on="item.events || {}"
            />
            <component
              :is="componentMap.get(item.type)"
              v-else
              v-model.trim="queryParams[item.prop]"
              v-bind="{ style: { width: '100%' }, ...item.attrs }"
              v-on="item.events || {}"
            >
              <template v-if="item.type === 'select'">
                <template v-for="opt in item.options" :key="opt.value">
                  <el-option :label="opt.label" :value="opt.value" />
                </template>
              </template>
            </component>
          </el-form-item>
        </template>

        <el-form-item :class="{ 'col-[auto/-1] justify-self-end': searchConfig?.grid === 'right' }">
          <el-button icon="search" type="primary" @click="handleQuery">搜索</el-button>
          <el-button icon="refresh" @click="handleReset">重置</el-button>
          <!-- 展开/收起 -->
          <template v-if="isExpandable && formItems.length > showNumber">
            <el-link class="ml-3" type="primary" underline="never" @click="isExpand = !isExpand">
              {{ isExpand ? "收起" : "展开" }}
              <component :is="isExpand ? ArrowUp : ArrowDown" class="w-4 h-4 ml-2" />
            </el-link>
          </template>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import type { IObject, IForm, ISearchConfig, ISearchComponent } from "./types";
import { ArrowUp, ArrowDown } from "@element-plus/icons-vue";
import type { FormInstance } from "element-plus";
import InputTag from "@/components/InputTag/index.vue";

// 定义接收的属性
const props = defineProps<{ searchConfig: ISearchConfig }>();
// 自定义事件
const emit = defineEmits<{
  queryClick: [queryParams: IObject];
  resetClick: [queryParams: IObject];
}>();
// 组件映射表
const componentMap = new Map<ISearchComponent, any>([
  // @ts-ignore
  ["input", markRaw(ElInput)], // @ts-ignore
  ["select", markRaw(ElSelect)], // @ts-ignore
  ["cascader", markRaw(ElCascader)], // @ts-ignore
  ["input-number", markRaw(ElInputNumber)], // @ts-ignore
  ["date-picker", markRaw(ElDatePicker)], // @ts-ignore
  ["time-picker", markRaw(ElTimePicker)], // @ts-ignore
  ["time-select", markRaw(ElTimeSelect)], // @ts-ignore
  ["tree-select", markRaw(ElTreeSelect)], // @ts-ignore
  ["input-tag", markRaw(ElInputTag)], // @ts-ignore
  ["custom-tag", markRaw(InputTag)],
]);

// 存储表单实例
const queryFormRef = ref<FormInstance>();
// 存储查询参数
const queryParams = reactive<IObject>({});
// 是否显示
const visible = ref(true);
// 响应式的formItems
const formItems = reactive(props.searchConfig?.formItems ?? []);
// 是否可展开/收缩
const isExpandable = ref(props.searchConfig?.isExpandable ?? true);
// 是否已展开
const isExpand = ref(false);
// 表单项展示数量，若可展开，超出展示数量的表单项隐藏
const showNumber = computed(() =>
  isExpandable.value ? (props.searchConfig?.showNumber ?? 3) : formItems.length
);
// 卡片组件自定义属性（阴影、自定义边距样式等）
const cardAttrs = computed<IObject>(() => {
  return { shadow: "never", style: { "margin-bottom": "12px" }, ...props.searchConfig?.cardAttrs };
});
// 表单组件自定义属性（label位置、宽度、对齐方式等）
const formAttrs = computed<IForm>(() => {
  return { inline: true, ...props.searchConfig?.form };
});
// 是否使用自适应网格布局
const isGrid = computed(() =>
  props.searchConfig?.grid
    ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6 gap-5"
    : "flex flex-wrap gap-x-8 gap-y-4"
);

// 获取tooltip提示框属性
const getTooltipProps = (tips: string | IObject) => {
  return typeof tips === "string" ? { content: tips } : tips;
};
// 查询/重置操作
const handleQuery = () => emit("queryClick", queryParams);
const handleReset = () => {
  queryFormRef.value?.resetFields();
  emit("resetClick", queryParams);
};

onMounted(() => {
  formItems.forEach((item) => {
    if (item?.initFn) {
      item.initFn(item);
    }
    if (["input-tag", "custom-tag", "cascader"].includes(item?.type ?? "")) {
      queryParams[item.prop] = Array.isArray(item.initialValue) ? item.initialValue : [];
    } else if (item.type === "input-number") {
      queryParams[item.prop] = item.initialValue ?? null;
    } else {
      queryParams[item.prop] = item.initialValue ?? "";
    }
  });
});
// 暴露的属性和方法
defineExpose({
  // 获取分页数据
  getQueryParams: () => queryParams,
  // 显示/隐藏 SearchForm
  toggleVisible: () => (visible.value = !visible.value),
});
</script>

<style lang="scss" scoped>
:deep(.el-input-number .el-input__inner) {
  text-align: left;
}
.el-form-item {
  margin-right: 0;
  margin-bottom: 0;
}
</style>
