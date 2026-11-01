<template>
  <div v-show="visible">
    <el-card v-bind="cardAttrs">
      <el-alert v-if="optionError" class="mb-4" type="error" :title="optionError" :closable="false">
        <el-button link :loading="isInitializing" @click="initializeFields">重新加载选项</el-button>
      </el-alert>
      <el-form ref="queryFormRef" :model="queryParams" v-bind="formAttrs" :class="layoutClass">
        <el-form-item
          v-for="(item, index) in fields"
          v-show="isExpand || index < showNumber"
          :key="item.prop"
          :label="item.label"
          :prop="item.prop"
        >
          <template #label>
            <slot
              :name="'label-' + item.prop"
              :label="item.label"
              :form-data="queryParams"
              :prop="item.prop"
            >
              <span class="flex-y-center">
                {{ item.label }}
                <el-tooltip v-if="item.tips" v-bind="getTooltipProps(item.tips)">
                  <QuestionFilled class="w-4 h-4 mx-1" />
                </el-tooltip>
                <span v-if="searchConfig.colon" class="ml-0.5">:</span>
              </span>
            </slot>
          </template>
          <slot
            v-if="item.type === 'custom'"
            :name="item.slotName ?? item.prop"
            :form-data="queryParams"
            :prop="item.prop"
            :attrs="{ style: { width: '100%' }, ...item.attrs }"
          />
          <component
            :is="componentMap.get(item.type)"
            v-else
            v-model="queryParams[item.prop]"
            v-bind="{ style: { width: '100%' }, ...item.attrs }"
            v-on="item.events ?? {}"
          >
            <template v-if="item.type === 'select'">
              <el-option
                v-for="option in item.options"
                :key="String(option.value)"
                :label="option.label"
                :value="option.value"
              />
            </template>
          </component>
        </el-form-item>
        <el-form-item :class="{ 'col-[auto/-1] justify-self-end': searchConfig.grid === 'right' }">
          <el-button icon="search" type="primary" @click="handleQuery">搜索</el-button>
          <el-button icon="refresh" @click="handleReset">重置</el-button>
          <el-link
            v-if="isExpandable && fields.length > showNumber"
            class="ml-3"
            type="primary"
            underline="never"
            @click="isExpand = !isExpand"
          >
            {{ isExpand ? "收起" : "展开" }}
            <component :is="isExpand ? ArrowUp : ArrowDown" class="w-4 h-4 ml-2" />
          </el-link>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, markRaw, nextTick, reactive, ref } from "vue";
import type { Component } from "vue";
import { ArrowUp, ArrowDown } from "@element-plus/icons-vue";
import type { FormInstance } from "element-plus";
import { cloneDeep } from "lodash-es";
import InputTag from "@/components/InputTag/index.vue";
import type { CrudRecord, CrudSearchConfig, CrudSearchFieldType } from "./types";

const props = defineProps<{ searchConfig: CrudSearchConfig }>();
const emit = defineEmits<{
  search: [queryParams: CrudRecord];
  reset: [queryParams: CrudRecord];
}>();
const componentMap = new Map<CrudSearchFieldType, Component>([
  ["input", markRaw(ElInput)],
  ["select", markRaw(ElSelect)],
  ["cascader", markRaw(ElCascader)],
  ["input-number", markRaw(ElInputNumber)],
  ["date-picker", markRaw(ElDatePicker)],
  ["time-picker", markRaw(ElTimePicker)],
  ["time-select", markRaw(ElTimeSelect)],
  ["tree-select", markRaw(ElTreeSelect)],
  ["input-tag", markRaw(ElInputTag)],
  ["custom-tag", markRaw(InputTag)],
]);
const queryFormRef = ref<FormInstance>();
const visible = ref(true);
const isExpand = ref(false);
const optionError = ref("");
const isInitializing = ref(false);
const fields = reactive(
  (props.searchConfig.fields ?? []).map((item) => ({ ...item, attrs: { ...item.attrs } })),
);
const initialValues: CrudRecord = Object.fromEntries(
  fields.map((item) => [
    item.prop,
    cloneDeep(
      item.initialValue !== undefined
        ? item.initialValue
        : ["input-tag", "custom-tag", "cascader"].includes(item.type) || item.attrs?.multiple
          ? []
          : item.type === "input-number"
            ? null
            : "",
    ),
  ]),
);
const queryParams = reactive<CrudRecord>(cloneDeep(initialValues));
const isExpandable = computed(() => props.searchConfig.isExpandable ?? true);
const showNumber = computed(() =>
  isExpandable.value ? (props.searchConfig.showNumber ?? 3) : fields.length,
);
const cardAttrs = computed<NonNullable<CrudSearchConfig["cardAttrs"]>>(() => ({
  shadow: "never",
  style: { marginBottom: "12px" },
  ...props.searchConfig.cardAttrs,
}));
const formAttrs = computed(() => ({ inline: true, ...props.searchConfig.form }));
const layoutClass = computed(() =>
  props.searchConfig.grid
    ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6 gap-5"
    : "flex flex-wrap gap-x-8 gap-y-4",
);
/**
 * 加载字段选项；失败可重试，上一批结束前不重复加载。
 */
async function initializeFields(): Promise<void> {
  const initializers = fields.filter((field) => field.onInit);
  if (isInitializing.value || initializers.length === 0) return;
  isInitializing.value = true;
  optionError.value = "";
  const results = await Promise.allSettled(
    initializers.map((field) => Promise.resolve().then(() => field.onInit?.(field))),
  );
  const failure = results.find((result) => result.status === "rejected");
  if (failure?.status === "rejected")
    optionError.value =
      failure.reason instanceof Error ? failure.reason.message : "搜索选项加载失败";
  isInitializing.value = false;
}
void initializeFields();

/**
 * 字符串提示使用组件默认样式。
 */
function getTooltipProps(tips: string | CrudRecord): CrudRecord {
  return typeof tips === "string" ? { content: tips } : tips;
}

/**
 * 提交独立快照，继续输入不会改动已应用条件。
 */
function handleQuery(): void {
  emit("search", getQueryParams());
}

/**
 * 重置声明初值，数组不与配置共享引用。
 */
function handleReset(): void {
  emit("reset", reset());
}

/**
 * 恢复初值并返回查询快照，不触发搜索事件。
 */
function reset(): CrudRecord {
  Object.keys(queryParams).forEach((key) => Reflect.deleteProperty(queryParams, key));
  Object.assign(queryParams, cloneDeep(initialValues));
  void nextTick(() => queryFormRef.value?.clearValidate());
  return getQueryParams();
}

/**
 * 读取当前搜索草稿的副本。
 */
function getQueryParams(): CrudRecord {
  return cloneDeep(queryParams);
}

/**
 * 切换搜索区域。
 */
function toggleVisible(): void {
  visible.value = !visible.value;
}

defineExpose({ getQueryParams, toggleVisible, reset, initializeFields });
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
