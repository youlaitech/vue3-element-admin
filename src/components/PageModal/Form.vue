<template>
  <el-form
    ref="formRef"
    label-width="auto"
    v-bind="form"
    :model="formData"
    :rules="formRules"
  >
    <template v-for="item in formItems" :key="item.prop">
      <el-form-item v-show="!item.hidden" :label="item.label" :prop="item.prop">
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
          <el-input v-model="formData[item.prop]" v-bind="item.attrs" />
        </template>
        <!-- Select 选择器 -->
        <template v-else-if="item.type === 'select'">
          <el-select v-model="formData[item.prop]" v-bind="item.attrs">
            <template v-for="option in item.options" :key="option.value">
              <el-option v-bind="option" />
            </template>
          </el-select>
        </template>
        <!-- Radio 单选框 -->
        <template v-else-if="item.type === 'radio'">
          <el-radio-group v-model="formData[item.prop]" v-bind="item.attrs">
            <template v-for="option in item.options" :key="option.value">
              <el-radio v-bind="option" />
            </template>
          </el-radio-group>
        </template>
        <!-- Checkbox 多选框 -->
        <template v-else-if="item.type === 'checkbox'">
          <el-checkbox-group v-model="formData[item.prop]" v-bind="item.attrs">
            <template v-for="option in item.options" :key="option.value">
              <el-checkbox v-bind="option" />
            </template>
          </el-checkbox-group>
        </template>
        <!-- Input Number 数字输入框 -->
        <template v-else-if="item.type === 'input-number'">
          <el-input-number v-model="formData[item.prop]" v-bind="item.attrs" />
        </template>
        <!-- TreeSelect 树形选择 -->
        <template v-else-if="item.type === 'tree-select'">
          <el-tree-select v-model="formData[item.prop]" v-bind="item.attrs" />
        </template>
        <!-- DatePicker 日期选择器 -->
        <template v-else-if="item.type === 'date-picker'">
          <el-date-picker v-model="formData[item.prop]" v-bind="item.attrs" />
        </template>
        <!-- Text 文本 -->
        <template v-else-if="item.type === 'text'">
          <el-text v-bind="item.attrs">{{ formData[item.prop] }}</el-text>
        </template>
        <!-- 自定义 -->
        <template v-else-if="item.type === 'custom'">
          <slot
            :name="item.slotName ?? item.prop"
            :prop="item.prop"
            :formData="formData"
            :attrs="item.attrs"
          ></slot>
        </template>
      </el-form-item>
    </template>
  </el-form>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from "element-plus";
import { reactive, ref, watch, computed, watchEffect } from "vue";
import { IForm, IFormItems, IObject } from "./types";

// 定义接收的属性
const props = withDefaults(
  defineProps<{
    // 主键名(主要用于编辑数据,默认为id)
    pk?: string;
    // form组件属性
    form?: IForm;
    // 表单项
    formItems: IFormItems;
  }>(),
  {
    pk: "id",
  }
);

const formRef = ref<FormInstance>();
const formData = reactive<IObject>({});
const formRules: FormRules = {};
const watchArr = [];
const computedArr = [];
const watchEffectArr = [];
// 初始化
for (const item of props.formItems) {
  formData[item.prop] = item.initialValue ?? "";
  formRules[item.prop] = item.rules ?? [];
  if (item.watch !== undefined) {
    watchArr.push({ field: item.prop, func: item.watch });
  }
  if (item.computed !== undefined) {
    computedArr.push({ field: item.prop, func: item.computed });
  }
  if (item.watchEffect !== undefined) {
    watchEffectArr.push(item.watchEffect);
  }
}
watchArr.forEach(({ field, func }) => {
  watch(
    () => formData[field],
    (newValue, oldValue) => {
      func(newValue, oldValue, formData);
    }
  );
});
computedArr.forEach(({ field, func }) => {
  formData[field] = computed({
    get() {
      return func(formData);
    },
    // TODO
    set() {},
  });
});
watchEffectArr.forEach((func) => {
  watchEffect(() => {
    func(formData);
  });
});
// 获取表单数据
function getFormData(key?: string) {
  return key === undefined ? formData : formData[key] ?? undefined;
}
// 设置表单值
function setFormData(data: IObject) {
  for (const key in formData) {
    if (Object.hasOwn(formData, key) && key in data) {
      formData[key] = data[key];
    }
  }
  if (Object.hasOwn(data, props.pk)) {
    formData[props.pk] = data[props.pk];
  }
}
// 设置表单项值
function setFormItemData(key: string, value: any) {
  formData[key] = value;
}

// 暴露的属性和方法
defineExpose({ formRef, getFormData, setFormData, setFormItemData });
</script>
