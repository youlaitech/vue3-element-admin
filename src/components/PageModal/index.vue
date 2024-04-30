<template>
  <el-dialog
    v-model="dialogVisible"
    v-bind="modalConfig.dialog"
    @close="closeDialog"
  >
    <!-- 表单 -->
    <el-form
      ref="formRef"
      label-width="80px"
      v-bind="modalConfig.form"
      :model="formData"
      :rules="formRules"
    >
      <template v-for="item in modalConfig.formItems" :key="item.prop">
        <el-form-item :label="item.label" :prop="item.prop">
          <!-- Input 输入框 -->
          <template v-if="item.type === 'input'">
            <template v-if="item.attrs?.type === 'number'">
              <el-input
                v-model.number="formData[item.prop]"
                v-bind="item.attrs"
              />
            </template>
            <template v-else>
              <el-input v-model="formData[item.prop]" v-bind="item.attrs" />
            </template>
          </template>
          <!-- Select 选择器 -->
          <template v-else-if="item.type === 'select'">
            <el-select v-model="formData[item.prop]" v-bind="item.attrs">
              <template v-for="option in item.options" :key="option.value">
                <el-option :label="option.label" :value="option.value" />
              </template>
            </el-select>
          </template>
          <!-- Radio 单选框 -->
          <template v-else-if="item.type === 'radio'">
            <el-radio-group v-model="formData[item.prop]" v-bind="item.attrs">
              <template v-for="option in item.options" :key="option.value">
                <el-radio :label="option.label" :value="option.value" />
              </template>
            </el-radio-group>
          </template>
          <!-- Input Number 数字输入框 -->
          <template v-else-if="item.type === 'input-number'">
            <el-input-number
              v-model="formData[item.prop]"
              v-bind="item.attrs"
            />
          </template>
          <!-- TreeSelect 树形选择 -->
          <template v-else-if="item.type === 'tree-select'">
            <el-tree-select v-model="formData[item.prop]" v-bind="item.attrs" />
          </template>
          <!-- DatePicker 日期选择器 -->
          <template v-else-if="item.type === 'date-picker'">
            <el-date-picker v-model="formData[item.prop]" v-bind="item.attrs" />
          </template>
          <!-- 自定义 -->
          <template v-else-if="item.type === 'custom'">
            <slot
              :name="item.slotName ?? item.prop"
              :prop="item.prop"
              v-bind="item.attrs"
            ></slot>
          </template>
          <!-- Input 输入框 -->
          <template v-else>
            <template v-if="item.attrs?.type === 'number'">
              <el-input
                v-model.number="formData[item.prop]"
                v-bind="item.attrs"
              />
            </template>
            <template v-else>
              <el-input v-model="formData[item.prop]" v-bind="item.attrs" />
            </template>
          </template>
        </el-form-item>
      </template>
    </el-form>
    <!-- 弹窗底部操作按钮 -->
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
        <el-button @click="closeDialog">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import { useThrottleFn } from "@vueuse/core";
import type {
  DialogProps,
  FormProps,
  FormRules,
  FormItemRule,
} from "element-plus";

// 对象类型
type IObject = Record<string, any>;
// 定义接收的属性
export interface IModalConfig<T = any> {
  // 页面名称
  pageName?: string;
  // 主键名(主要用于编辑数据,默认为id)
  pk?: string;
  // dialog组件属性
  dialog?: Partial<Omit<DialogProps, "modelValue">>;
  // form组件属性
  form?: Partial<Omit<FormProps, "model" | "rules">>;
  // 提交的网络请求函数(需返回promise)
  formAction: (data: T) => Promise<any>;
  // 提交之前处理
  beforeSubmit?: (data: T) => void;
  // 表单项
  formItems: Array<{
    // 组件类型(如input,select,radio,custom等，默认input)
    type?:
      | "input"
      | "select"
      | "radio"
      | "tree-select"
      | "date-picker"
      | "input-number"
      | "custom";
    // 组件属性
    attrs?: IObject;
    // 组件可选项(适用于select,radio组件)
    options?: { label: string; value: any }[];
    // 插槽名(适用于组件类型为custom)
    slotName?: string;
    // 标签文本
    label: string;
    // 键名
    prop: string;
    // 验证规则
    rules?: FormItemRule[];
    // 初始值
    initialValue?: any;
    // 监听函数
    watch?: (newValue: any, oldValue: any, data: T) => void;
  }>;
}
const props = defineProps<{
  modalConfig: IModalConfig;
}>();
// 自定义事件
const emit = defineEmits<{
  submitClick: [];
}>();
// 暴露的属性和方法
defineExpose({ setModalVisible });

const pk = props.modalConfig.pk ?? "id";
const dialogVisible = ref(false);
const formRef = ref<InstanceType<typeof ElForm>>();
const formData = reactive<IObject>({});
const formRules: FormRules = {};
// 初始化
for (const item of props.modalConfig.formItems) {
  formData[item.prop] = item.initialValue ?? "";
  formRules[item.prop] = item.rules ?? [];
  if (item.watch !== undefined) {
    watch(
      () => formData[item.prop],
      (newValue, oldValue) => {
        item.watch?.(newValue, oldValue, formData);
      }
    );
  }
}
// 显示dialog
function setModalVisible(initData: IObject = {}) {
  dialogVisible.value = true;
  for (const key in formData) {
    if (Object.hasOwn(formData, key) && key in initData) {
      formData[key] = initData[key];
    }
  }
  if (Object.hasOwn(initData, pk)) {
    formData[pk] = initData[pk];
  }
}
// 表单提交
const handleSubmit = useThrottleFn(() => {
  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      if (typeof props.modalConfig.beforeSubmit === "function") {
        props.modalConfig.beforeSubmit(formData);
      }
      props.modalConfig.formAction(formData).then(() => {
        ElMessage.success(
          props.modalConfig.dialog?.title
            ? `${props.modalConfig.dialog.title}成功`
            : "操作成功"
        );
        emit("submitClick");
        closeDialog();
      });
    }
  });
}, 3000);
// 关闭弹窗
function closeDialog() {
  dialogVisible.value = false;
  formRef.value?.resetFields();
  formRef.value?.clearValidate();
}
</script>

<style lang="scss" scoped></style>
