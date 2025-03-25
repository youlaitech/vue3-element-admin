<template>
  <el-card
    v-show="visible"
    v-hasPerm="[`${searchConfig.pageName}:query`]"
    shadow="never"
    class="mb-2.5"
  >
    <el-form ref="queryFormRef" :model="queryParams" :inline="true">
      <template v-for="(item, index) in formItems" :key="item.prop">
        <el-form-item
          v-show="isExpand ? true : index < showNumber"
          :label="item.label"
          :prop="item.prop"
        >
          <!-- Label -->
          <template v-if="item.tips" #label>
            <span class="flex-y-center">
              {{ item.label }}
              <el-tooltip v-bind="getTooltipProps(item.tips)">
                <QuestionFilled class="w-4 h-4 mx-1" />
              </el-tooltip>
              {{ searchConfig.colon === false ? "" : ":" }}
            </span>
          </template>
          <template v-else #label>
            {{ item.label }} {{ searchConfig.colon === false ? "" : ":" }}
          </template>

          <component
            :is="componentMap[item?.type ? item?.type : 'input']"
            v-model.trim="queryParams[item.prop]"
            v-bind="item.attrs"
            :config="item.attrs"
            v-on="item.events || {}"
          >
            <template v-if="item.type === 'select'">
              <template v-for="opt in item.options">
                <el-option :label="opt.label" :value="opt.value" />
              </template>
            </template>
          </component>
        </el-form-item>
      </template>
      <el-form-item>
        <el-button icon="search" type="primary" @click="handleQuery">搜索</el-button>
        <el-button icon="refresh" @click="handleReset">重置</el-button>
        <!-- 展开/收起 -->
        <el-link
          v-if="isExpandable && formItems.length > showNumber"
          class="ml-3"
          type="primary"
          :underline="false"
          @click="isExpand = !isExpand"
        >
          {{ isExpand ? "收起" : "展开" }}
          <component :is="isExpand ? ArrowUp : ArrowDown" class="w-4 h-4 ml-2" />
        </el-link>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import type { IObject, ISearchConfig, ComponentType } from "./types";
import { ArrowUp, ArrowDown } from "@element-plus/icons-vue";
import { ElInput, ElInputNumber, ElInputTag, ElSelect, ElCascader } from "element-plus";
import { ElTimePicker, ElTimeSelect, ElOption, ElDatePicker, ElTreeSelect } from "element-plus";
import { type FormInstance } from "element-plus";
import InputTag from "@/components/InputTag/index.vue";

// 定义接收的属性
const props = defineProps<{ searchConfig: ISearchConfig }>();
// 自定义事件
const emit = defineEmits<{
  queryClick: [queryParams: IObject];
  resetClick: [queryParams: IObject];
}>();
// 组件映射表
const componentMap: Record<ComponentType, Component> = {
  input: markRaw(ElInput),
  select: markRaw(ElSelect),
  cascader: markRaw(ElCascader),
  "input-number": markRaw(ElInputNumber),
  "date-picker": markRaw(ElDatePicker),
  "time-picker": markRaw(ElTimePicker),
  "time-select": markRaw(ElTimeSelect),
  "tree-select": markRaw(ElTreeSelect),
  "input-tag": markRaw(ElInputTag),
  "custom-tag": markRaw(InputTag),
};

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
const showNumber = computed(() =>
  isExpandable.value ? (props.searchConfig.showNumber ?? 3) : formItems.length
);
// 搜索表单数据
const queryParams = reactive<IObject>({});
// 获取tooltip的属性
const getTooltipProps = (tips: any) => {
  return typeof tips === "string" ? { content: tips } : tips;
};

onMounted(() => {
  formItems.map((item) => {
    item.initFn && item.initFn(item);
    if (item.type === "input-tag" || item.type === "custom-tag") {
      queryParams[item.prop] = item.initialValue ?? [];
    } else if (item.type === "input-number") {
      queryParams[item.prop] = item.initialValue ?? null;
    } else {
      queryParams[item.prop] = item.initialValue ?? "";
    }
  });
});

// 查询/重置操作
const handleQuery = () => emit("queryClick", queryParams);
const handleReset = () => {
  queryFormRef.value?.resetFields();
  emit("resetClick", queryParams);
};

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
.el-form {
  display: flex;
  flex-wrap: wrap;
  row-gap: 1rem;
  column-gap: 2rem;
}
.el-form-item {
  margin-right: 0;
  margin-bottom: 0;
}
</style>
