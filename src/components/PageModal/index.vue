<template>
  <!-- drawer -->
  <template v-if="modalConfig.component === 'drawer'">
    <el-drawer
      v-model="modalVisible"
      :append-to-body="true"
      v-bind="modalConfig.drawer"
      @open="handleOpenModal"
      @close="handleCloseModal"
    >
      <!-- 表单 -->
      <page-form
        ref="pageFormRef"
        :pk="modalConfig.pk"
        :form="modalConfig.form"
        :form-items="modalConfig.formItems"
      />
      <!-- 弹窗底部操作按钮 -->
      <template #footer>
        <div>
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
          <el-button @click="handleCloseModal">取 消</el-button>
        </div>
      </template>
    </el-drawer>
  </template>
  <!-- dialog -->
  <template v-else>
    <el-dialog
      v-model="modalVisible"
      :align-center="true"
      :append-to-body="true"
      width="70vw"
      v-bind="modalConfig.dialog"
      style="padding-right: 0"
      @open="handleOpenModal"
      @close="handleCloseModal"
    >
      <!-- 滚动 -->
      <el-scrollbar max-height="65vh">
        <!-- 表单 -->
        <page-form
          ref="pageFormRef"
          :pk="modalConfig.pk"
          :form="modalConfig.form"
          :form-items="modalConfig.formItems"
          style="padding-right: var(--el-dialog-padding-primary)"
        />
      </el-scrollbar>
      <!-- 弹窗底部操作按钮 -->
      <template #footer>
        <div style="padding-right: var(--el-dialog-padding-primary)">
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
          <el-button @click="handleCloseModal">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </template>
</template>

<script setup lang="ts">
import { useThrottleFn } from "@vueuse/core";
import { ref } from "vue";
import PageForm from "./Form.vue";
import { IDialog, IDrawer, IForm, IFormItems, IObject } from "./types";

// 定义接收的属性
export interface IModalConfig<T = any> {
  // 页面名称
  pageName?: string;
  // 主键名(主要用于编辑数据,默认为id)
  pk?: string;
  // 组件类型
  component?: "dialog" | "drawer";
  // dialog组件属性
  dialog?: IDialog;
  // drawer组件属性
  drawer?: IDrawer;
  // form组件属性
  form?: IForm;
  // 表单项
  formItems: IFormItems<T>;
  // 提交之前处理
  beforeSubmit?: (data: T) => void;
  // 提交的网络请求函数(需返回promise)
  formAction: (data: T) => Promise<any>;
}
const props = defineProps<{
  modalConfig: IModalConfig;
}>();
// 自定义事件
const emit = defineEmits<{
  submitClick: [];
}>();

const modalVisible = ref(false);
const pageFormRef = ref<InstanceType<typeof PageForm>>();
let initialFormData = {};
// 显示modal
function setModalVisible(data: IObject = {}) {
  modalVisible.value = true;
  initialFormData = data;
}
// 表单提交
const handleSubmit = useThrottleFn(() => {
  pageFormRef.value?.formRef?.validate((valid: boolean) => {
    if (valid) {
      const formData = pageFormRef.value?.getFormData();
      if (typeof props.modalConfig.beforeSubmit === "function") {
        props.modalConfig.beforeSubmit(formData);
      }
      props.modalConfig.formAction(formData).then(() => {
        let msg = "操作成功";
        if (props.modalConfig.component === "drawer") {
          if (props.modalConfig.drawer?.title) {
            msg = props.modalConfig.drawer?.title;
          }
        } else {
          if (props.modalConfig.dialog?.title) {
            msg = props.modalConfig.dialog?.title;
          }
        }
        ElMessage.success(msg);
        emit("submitClick");
        handleCloseModal();
      });
    }
  });
}, 3000);
// 打开弹窗
function handleOpenModal() {
  pageFormRef.value?.setFormData(initialFormData);
}
// 关闭弹窗
function handleCloseModal() {
  modalVisible.value = false;
  pageFormRef.value?.formRef?.resetFields();
  pageFormRef.value?.formRef?.clearValidate();
}
// 暴露的属性和方法
defineExpose({ setModalVisible });
</script>

<style lang="scss" scoped></style>
