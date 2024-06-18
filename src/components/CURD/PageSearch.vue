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
          <!-- Label -->
          <template #label v-if="item.tips">
            <span>
              {{ item.label }}
              <el-tooltip
                placement="bottom"
                effect="light"
                :content="item.tips"
                :raw-content="true"
              >
                <el-icon style="vertical-align: -0.15em" size="16">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </span>
          </template>
          <!-- Input 输入框 -->
          <template v-if="item.type === 'input' || item.type === undefined">
            <el-input
              v-model="queryParams[item.prop]"
              v-bind="item.attrs"
              @keyup.enter="handleQuery"
            />
          </template>
          <!-- InputTag 标签输入框 -->
          <template v-if="item.type === 'input-tag'">
            <div class="flex-center">
              <el-tag
                v-for="tag in inputTagMap[item.prop].data"
                class="mr-2"
                :key="tag"
                :closable="true"
                v-bind="inputTagMap[item.prop].tagAttrs"
                @close="handleCloseTag(item.prop, tag)"
              >
                {{ tag }}
              </el-tag>
              <template v-if="inputTagMap[item.prop].inputVisible">
                <el-input
                  :ref="(el) => (inputTagMap[item.prop].inputRef = el)"
                  v-model="inputTagMap[item.prop].inputValue"
                  v-bind="inputTagMap[item.prop].inputAttrs"
                  @keyup.enter="handleInputConfirm(item.prop)"
                  @blur="handleInputConfirm(item.prop)"
                />
              </template>
              <template v-else>
                <el-button
                  v-bind="inputTagMap[item.prop].buttonAttrs"
                  @click="handleShowInput(item.prop)"
                >
                  {{ inputTagMap[item.prop].buttonAttrs.btnText }}
                </el-button>
              </template>
            </div>
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
import type { IObject, ISearchConfig } from "./types";

// 定义接收的属性
const props = defineProps<{
  searchConfig: ISearchConfig;
}>();
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
const inputTagMap = reactive<IObject>({});
for (const item of formItems) {
  item.initFn && item.initFn(item);
  if (item.type === "input-tag") {
    inputTagMap[item.prop] = {
      data: Array.isArray(item.initialValue) ? item.initialValue : [],
      inputVisible: false,
      inputValue: "",
      inputRef: null,
      buttonAttrs: {
        size: item.attrs?.size ?? "default",
        btnText: item.attrs?.btnText ?? "+ New Tag",
        style: "color: #b0b2b7",
      },
      inputAttrs: {
        size: item.attrs?.size ?? "default",
        clearable: item.attrs?.clearable ?? false,
        style: "width: 150px",
      },
      tagAttrs: {
        size: item.attrs?.size ?? "default",
      },
    };
    queryParams[item.prop] = computed({
      get() {
        return typeof item.attrs?.join === "string"
          ? inputTagMap[item.prop].data.join(item.attrs.join)
          : inputTagMap[item.prop].data;
      },
      set(value) {
        // resetFields时会被调用
        inputTagMap[item.prop].data =
          typeof item.attrs?.join === "string"
            ? value.split(item.attrs.join).filter((item: any) => item !== "")
            : value;
      },
    });
  } else {
    queryParams[item.prop] = item.initialValue ?? "";
  }
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

// 关闭标签
function handleCloseTag(prop: string, tag: string) {
  inputTagMap[prop].data.splice(inputTagMap[prop].data.indexOf(tag), 1);
}
// 添加标签
function handleInputConfirm(prop: string) {
  if (inputTagMap[prop].inputValue) {
    inputTagMap[prop].data.push(inputTagMap[prop].inputValue);
  }
  inputTagMap[prop].inputVisible = false;
  inputTagMap[prop].inputValue = "";
}
// 显示标签输入框
function handleShowInput(prop: string) {
  inputTagMap[prop].inputVisible = true;
  nextTick(() => {
    inputTagMap[prop].inputRef.focus();
  });
}

// 暴露的属性和方法
defineExpose({ getQueryParams, toggleVisible });
</script>

<style lang="scss" scoped></style>
