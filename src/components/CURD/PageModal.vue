<template>
  <!-- drawer -->
  <template v-if="modalConfig.component === 'drawer'">
    <el-drawer
      v-model="modalVisible"
      :append-to-body="true"
      v-bind="modalConfig.drawer"
      @close="handleCloseModal"
    >
      <!-- 表单 -->
      <el-form
        ref="formRef"
        label-width="auto"
        v-bind="modalConfig.form"
        :model="formData"
        :rules="formRules"
      >
        <template v-for="item in formItems" :key="item.prop">
          <el-form-item
            v-show="!item.hidden"
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
              <el-checkbox-group
                v-model="formData[item.prop]"
                v-bind="item.attrs"
              >
                <template v-for="option in item.options" :key="option.value">
                  <el-checkbox v-bind="option" />
                </template>
              </el-checkbox-group>
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
              <el-tree-select
                v-model="formData[item.prop]"
                v-bind="item.attrs"
              />
            </template>
            <!-- DatePicker 日期选择器 -->
            <template v-else-if="item.type === 'date-picker'">
              <el-date-picker
                v-model="formData[item.prop]"
                v-bind="item.attrs"
              />
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
              >
              </slot>
            </template>
          </el-form-item>
        </template>
      </el-form>
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
      @close="handleCloseModal"
    >
      <!-- 滚动 -->
      <el-scrollbar max-height="60vh">
        <!-- 表单 -->
        <el-form
          ref="formRef"
          label-width="auto"
          v-bind="modalConfig.form"
          style="padding-right: var(--el-dialog-padding-primary)"
          :model="formData"
          :rules="formRules"
        >
          <template v-for="item in formItems" :key="item.prop">
            <el-form-item
              v-show="!item.hidden"
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
                <el-radio-group
                  v-model="formData[item.prop]"
                  v-bind="item.attrs"
                >
                  <template v-for="option in item.options" :key="option.value">
                    <el-radio v-bind="option" />
                  </template>
                </el-radio-group>
              </template>
              <!-- Checkbox 多选框 -->
              <template v-else-if="item.type === 'checkbox'">
                <el-checkbox-group
                  v-model="formData[item.prop]"
                  v-bind="item.attrs"
                >
                  <template v-for="option in item.options" :key="option.value">
                    <el-checkbox v-bind="option" />
                  </template>
                </el-checkbox-group>
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
                <el-tree-select
                  v-model="formData[item.prop]"
                  v-bind="item.attrs"
                />
              </template>
              <!-- DatePicker 日期选择器 -->
              <template v-else-if="item.type === 'date-picker'">
                <el-date-picker
                  v-model="formData[item.prop]"
                  v-bind="item.attrs"
                />
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
                >
                </slot>
              </template>
            </el-form-item>
          </template>
        </el-form>
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
import type { FormInstance, FormRules } from "element-plus";
import { nextTick, reactive, ref, watch, watchEffect } from "vue";
import type { IModalConfig, IObject } from "./types";

// 定义接收的属性
const props = defineProps<{
  modalConfig: IModalConfig;
}>();
// 自定义事件
const emit = defineEmits<{
  submitClick: [];
}>();

const pk = props.modalConfig.pk ?? "id";
const modalVisible = ref(false);
const formRef = ref<FormInstance>();
const formItems = reactive(props.modalConfig.formItems);
const formData = reactive<IObject>({});
const formRules: FormRules = {};
const prepareFuncs = [];
for (const item of formItems) {
  item.initFn && item.initFn(item);
  formData[item.prop] = item.initialValue ?? "";
  formRules[item.prop] = item.rules ?? [];

  if (item.watch !== undefined) {
    prepareFuncs.push(() => {
      watch(
        () => formData[item.prop],
        (newValue, oldValue) => {
          item.watch && item.watch(newValue, oldValue, formData, formItems);
        }
      );
    });
  }

  if (item.computed !== undefined) {
    prepareFuncs.push(() => {
      watchEffect(() => {
        item.computed && (formData[item.prop] = item.computed(formData));
      });
    });
  }

  if (item.watchEffect !== undefined) {
    prepareFuncs.push(() => {
      watchEffect(() => {
        item.watchEffect && item.watchEffect(formData);
      });
    });
  }
}
prepareFuncs.forEach((func) => func());

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
  if (Object.hasOwn(data, pk)) {
    formData[pk] = data[pk];
  }
}

// 设置表单项值
function setFormItemData(key: string, value: any) {
  formData[key] = value;
}

// 显示modal
function setModalVisible(data: IObject = {}) {
  modalVisible.value = true;
  // nextTick解决赋值后重置表单无效问题
  nextTick(() => {
    Object.values(data).length > 0 && setFormData(data);
  });
}

// 表单提交
const handleSubmit = useThrottleFn(() => {
  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      if (typeof props.modalConfig.beforeSubmit === "function") {
        props.modalConfig.beforeSubmit(formData);
      }
      props.modalConfig.formAction(formData).then(() => {
        let msg = "操作成功";
        if (props.modalConfig.component === "drawer") {
          if (props.modalConfig.drawer?.title) {
            msg = `${props.modalConfig.drawer?.title}成功`;
          }
        } else {
          if (props.modalConfig.dialog?.title) {
            msg = `${props.modalConfig.dialog?.title}成功`;
          }
        }
        ElMessage.success(msg);
        emit("submitClick");
        handleCloseModal();
      });
    }
  });
}, 3000);

// 关闭弹窗
function handleCloseModal() {
  modalVisible.value = false;
  formRef.value?.resetFields();
  nextTick(() => {
    formRef.value?.clearValidate();
  });
}

// 暴露的属性和方法
defineExpose({ setModalVisible, getFormData, setFormData, setFormItemData });
</script>

<style lang="scss" scoped></style>
