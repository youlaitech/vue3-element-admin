<template>
  <el-dialog
    v-model="dialogVisible"
    v-bind="modalConfig.dialog"
    @close="closeDialog"
  >
    <!-- 表单 -->
    <el-form
      ref="formRef"
      :model="formData"
      :rules="modalConfig.formRules"
      label-width="80px"
    >
      <template v-for="item in modalConfig.formItems" :key="item.prop">
        <el-form-item :label="item.label" :prop="item.prop">
          <!-- Select 选择器 -->
          <template v-if="item.type === 'select'">
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
            <el-input v-model="formData[item.prop]" v-bind="item.attrs" />
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
import { ref, reactive } from "vue";
import { useThrottleFn } from "@vueuse/core";
import type { FormRules, DialogProps } from "element-plus";

// 对象类型
type IObject = Record<string, any>;
// 定义接收的属性
export interface IModalConfig {
  // dialog组件属性
  dialog: Partial<Omit<DialogProps, "modelValue">>;
  // 页面名称
  pageName?: string;
  // 提交的网络请求函数(需返回promise)
  formAction: (data: IObject) => Promise<any>;
  // 表单项
  formItems: Array<{
    // 组件类型(如input,select,radio等)
    type: string;
    // 标签文本
    label: string;
    // 键名
    prop: string;
    // 组件属性
    attrs?: IObject;
    // 初始值
    initialValue?: any;
    // 可选项(适用于select,radio组件)
    options?: { label: string; value: any }[];
    // 插槽名(适用于组件类型为custom)
    slotName?: string;
  }>;
  // 表单验证规则
  formRules: FormRules;
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

const dialogVisible = ref(false);
const formRef = ref<InstanceType<typeof ElForm>>();
const formData = reactive<IObject>({});
// 初始化
function setModalVisible(initData: IObject = {}) {
  dialogVisible.value = true;
  for (const item of props.modalConfig.formItems) {
    formData[item.prop] = initData[item.prop] ?? item.initialValue ?? "";
  }
}
// 表单提交
const handleSubmit = useThrottleFn(() => {
  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      props.modalConfig.formAction(formData).then(() => {
        ElMessage.success(
          props.modalConfig.dialog.title
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
