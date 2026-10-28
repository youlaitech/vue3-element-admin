<template>
  <component
    :is="formConfig.component === 'drawer' ? ElDrawer : ElDialog"
    v-model="modalVisible"
    v-bind="containerAttrs"
    :before-close="beforeClose"
    @close="handleClose"
  >
    <el-alert v-if="optionError" class="mb-4" type="error" :title="optionError" :closable="false">
      <el-button link :loading="isInitializing" @click="initializeFields">重新加载选项</el-button>
    </el-alert>
    <el-alert v-if="formError" class="mb-4" type="error" :title="formError" :closable="false">
      <el-button v-if="hasLoadError && lastLoader" link @click="retryLoad">重新加载</el-button>
    </el-alert>
    <el-form
      ref="formRef"
      v-loading="isLoading || isInitializing"
      v-bind="formAttrs"
      :model="formData"
      :rules="formRules"
    >
      <el-scrollbar max-height="70vh">
        <el-row :gutter="20">
          <template v-for="item in fields" :key="item.prop">
            <el-col v-if="isFieldVisible(item)" v-bind="item.col">
              <el-form-item :label="getFieldLabel(item)" :prop="item.prop">
                <template #label>
                  <slot
                    :name="'label-' + item.prop"
                    :prop="item.prop"
                    :label="getFieldLabel(item)"
                    :mode="formMode"
                    :form-data="formData"
                    :attrs="getFieldAttrs(item)"
                  >
                    <span>{{ getFieldLabel(item) }}</span>
                    <el-tooltip v-if="item.tips" v-bind="getTooltipProps(item.tips)">
                      <QuestionFilled class="w-4 h-4 mx-1" />
                    </el-tooltip>
                    <span v-if="formConfig.colon" class="ml-0.5">:</span>
                  </slot>
                </template>
                <slot
                  v-if="item.type === 'custom'"
                  :name="item.slotName ?? item.prop"
                  :prop="item.prop"
                  :mode="formMode"
                  :form-data="formData"
                  :attrs="getFieldAttrs(item)"
                  :label="getFieldLabel(item)"
                />
                <el-text v-else-if="item.type === 'text'" v-bind="item.attrs">
                  {{ formData[item.prop] }}
                </el-text>
                <component
                  :is="componentMap.get(item.type)"
                  v-else
                  v-model="formData[item.prop]"
                  v-bind="getFieldAttrs(item)"
                  v-on="item.events ?? {}"
                >
                  <template v-if="['select', 'radio', 'checkbox'].includes(item.type)">
                    <component
                      :is="childrenMap.get(item.type)"
                      v-for="option in item.options"
                      :key="String(option.value)"
                      :label="option.label"
                      :value="option.value"
                    />
                  </template>
                  <template v-if="item.slotName && $slots[item.slotName]" #[item.slotName]>
                    <slot
                      :name="item.slotName"
                      :prop="item.prop"
                      :mode="formMode"
                      :form-data="formData"
                      :attrs="getFieldAttrs(item)"
                      :label="getFieldLabel(item)"
                    />
                  </template>
                </component>
              </el-form-item>
            </el-col>
          </template>
        </el-row>
        <slot name="bottom" prop="" label="" :mode="formMode" :form-data="formData" :attrs="{}" />
      </el-scrollbar>
    </el-form>
    <template #footer>
      <el-button
        v-if="!formDisable"
        type="primary"
        :loading="isSaving"
        :disabled="isLoading || isInitializing || !!optionError || hasLoadError"
        @click="handleSubmit"
      >
        确定
      </el-button>
      <el-button
        v-if="!formDisable"
        :disabled="isSaving || isLoading || isInitializing"
        @click="resetForm"
      >
        重置
      </el-button>
      <el-button :disabled="isSaving" @click="handleClose">关闭</el-button>
    </template>
  </component>
</template>

<script setup lang="ts">
import { computed, nextTick, onScopeDispose, reactive, ref, shallowRef } from "vue";
import type { Component, VNode } from "vue";
import { ElDialog, ElDrawer, type FormInstance, type FormRules } from "element-plus";
import cloneDeep from "lodash-es/cloneDeep";
import type {
  CrudFieldType,
  CrudFormConfig,
  CrudRecord,
  CrudFormField,
  CrudFormMode,
  CrudFormContext,
} from "./types";
import InputTag from "@/components/InputTag/index.vue";
import IconSelect from "@/components/IconSelect/index.vue";

defineSlots<
  Record<
    string,
    (scope: {
      prop: string;
      label: string;
      mode: CrudFormMode;
      formData: CrudRecord;
      attrs: CrudRecord;
    }) => VNode[]
  >
>();
const props = defineProps<{ formConfig: CrudFormConfig }>();
const emit = defineEmits<{ saved: [] }>();

const componentMap = new Map<CrudFieldType, Component | string>([
  ["input", ElInput],
  ["select", ElSelect],
  ["switch", ElSwitch],
  ["cascader", ElCascader],
  ["input-number", ElInputNumber],
  ["input-tag", InputTag],
  ["time-picker", ElTimePicker],
  ["time-select", ElTimeSelect],
  ["date-picker", ElDatePicker],
  ["tree-select", ElTreeSelect],
  ["custom-tag", InputTag],
  ["radio", ElRadioGroup],
  ["checkbox", ElCheckboxGroup],
  ["icon-select", IconSelect],
  ["custom", ""],
]);
const childrenMap = new Map<CrudFieldType, Component>([
  ["select", ElOption],
  ["radio", ElRadio],
  ["checkbox", ElCheckbox],
]);
const fields = reactive(
  props.formConfig.fields.map((item) => ({ ...item, attrs: { ...item.attrs } }))
);
const rowKey = props.formConfig.rowKey ?? "id";
const modalVisible = ref(false);
const formRef = ref<FormInstance>();
const formData = reactive<CrudRecord>({});
const formMode = ref<CrudFormMode>("create");
const targetId = ref<string | number>();
const formDisable = computed(
  () => formMode.value === "view" || props.formConfig.form?.disabled === true
);
const isLoading = ref(false);
const isSaving = ref(false);
const hasLoadError = ref(false);
const formError = ref("");
const optionError = ref("");
const isInitializing = ref(false);
const lastLoader = shallowRef<(() => Promise<CrudRecord>) | undefined>();
let revision = 0;
let initialValues: CrudRecord = {};
const formAttrs = computed(() => ({
  labelWidth: "auto",
  ...props.formConfig.form,
  disabled: formDisable.value || isLoading.value || isSaving.value || isInitializing.value,
}));
const containerAttrs = computed(() => ({
  destroyOnClose: true,
  ...(props.formConfig.component === "drawer"
    ? props.formConfig.drawer
    : { alignCenter: true, ...props.formConfig.dialog }),
  ...(props.formConfig.title
    ? {
        title:
          typeof props.formConfig.title === "function"
            ? props.formConfig.title(getFormContext())
            : props.formConfig.title,
      }
    : {}),
}));
const formRules = computed<FormRules>(() =>
  Object.fromEntries(fields.filter(isFieldVisible).map((item) => [item.prop, getFieldRules(item)]))
);
onScopeDispose(() => {
  revision += 1;
});

/**
 * 查看、加载和保存时禁用字段，不能被 attrs 覆盖。
 */
function getFieldAttrs(item: CrudFormField): CrudRecord {
  const readonly =
    item.readonly === undefined ? !!item.attrs?.readonly : evaluateField(item.readonly);
  return {
    style: { width: "100%" },
    ...item.attrs,
    readonly,
    disabled:
      formDisable.value ||
      isLoading.value ||
      isSaving.value ||
      isInitializing.value ||
      !!item.attrs?.disabled ||
      (readonly && item.type !== "input"),
  };
}

/**
 * 提供模式、目标主键及当前表单数据。
 */
function getFormContext(model = formData): CrudFormContext {
  return { mode: formMode.value, id: targetId.value, model };
}

/**
 * 按当前模式和数据计算字段条件。
 */
function evaluateField(value: boolean | ((context: CrudFormContext) => boolean)): boolean {
  return typeof value === "function" ? value(getFormContext()) : value;
}

/**
 * 隐藏字段不校验，数据仍保留。
 */
function isFieldVisible(item: CrudFormField): boolean {
  return !item.hidden && (item.visible === undefined || evaluateField(item.visible));
}

/**
 * 读取字段标签，支持按模式或数据计算。
 */
function getFieldLabel(item: CrudFormField): string {
  return typeof item.label === "function" ? item.label(getFormContext()) : item.label;
}

/**
 * 动态必填只覆盖必填标志，保留其他校验约束。
 */
function getFieldRules(item: CrudFormField) {
  const rules = item.rules ?? [];
  if (item.required === undefined) return rules;
  const required = evaluateField(item.required);
  if (rules.some((rule) => rule.required !== undefined))
    return rules.map((rule) => (rule.required === undefined ? rule : { ...rule, required }));
  return [{ required, message: getFieldLabel(item) + "不能为空", trigger: "change" }, ...rules];
}

/**
 * 将字符串提示转换为 Tooltip 的 content 属性。
 */
function getTooltipProps(tips: string | CrudRecord): CrudRecord {
  return typeof tips === "string" ? { content: tips } : tips;
}

/**
 * 每次打开创建独立默认值，避免复用上次记录。
 */
function initializeForm(): void {
  Object.keys(formData).forEach((key) => Reflect.deleteProperty(formData, key));
  for (const item of fields) {
    const fallback =
      ["input-tag", "custom-tag", "cascader", "checkbox"].includes(item.type) ||
      item.attrs?.multiple
        ? []
        : item.type === "input-number"
          ? null
          : "";
    formData[item.prop] = cloneDeep(item.initialValue === undefined ? fallback : item.initialValue);
  }
  initialValues = cloneDeep(formData);
}

/**
 * 每次切换使旧详情请求失效；打开时重建初值。
 */
function setModalVisible(visible = true): void {
  if (isSaving.value) return;
  revision += 1;
  isLoading.value = false;
  hasLoadError.value = false;
  formError.value = "";
  lastLoader.value = undefined;
  if (visible) initializeForm();
  modalVisible.value = visible;
}

/**
 * 按模式打开表单，更新目标以传入记录的主键为准。
 */
function openForm(mode: CrudFormMode = "create", row?: CrudRecord): boolean {
  if (isSaving.value) return false;
  const id: unknown = row?.[rowKey];
  if (mode !== "create" && typeof id !== "string" && typeof id !== "number")
    throw new Error("编辑或查看记录缺少主键");
  formMode.value = mode;
  targetId.value =
    mode === "create"
      ? undefined
      : typeof id === "string" || typeof id === "number"
        ? id
        : undefined;
  setModalVisible();
  return true;
}

/**
 * 回填详情，并作为重置时的初值。
 */
function setFormData(data: CrudRecord): void {
  initializeForm();
  for (const key of Object.keys(formData)) {
    if (Object.hasOwn(data, key)) formData[key] = cloneDeep(data[key]);
  }
  if (targetId.value !== undefined) formData[rowKey] = targetId.value;
  else if (Object.hasOwn(data, rowKey)) formData[rowKey] = cloneDeep(data[rowKey]);
  initialValues = cloneDeep(formData);
  void nextTick(() => formRef.value?.clearValidate());
}

/**
 * 只处理当前表单的最新详情请求，忽略旧响应。
 */
async function loadFormData(loader: () => Promise<CrudRecord>): Promise<void> {
  const current = ++revision;
  lastLoader.value = loader;
  isLoading.value = true;
  hasLoadError.value = false;
  formError.value = "";
  try {
    const data = await loader();
    if (current === revision && modalVisible.value) setFormData(data);
  } catch (error) {
    if (current === revision) {
      hasLoadError.value = true;
      formError.value = error instanceof Error ? error.message : "详情加载失败";
    }
  } finally {
    if (current === revision) isLoading.value = false;
  }
}

/**
 * 重试当前记录的详情。
 */
async function retryLoad(): Promise<void> {
  if (lastLoader.value) await loadFormData(lastLoader.value);
}

/**
 * 恢复本次打开的初值；已加载详情时恢复详情。
 */
function resetForm(): void {
  Object.keys(formData).forEach((key) => Reflect.deleteProperty(formData, key));
  Object.assign(formData, cloneDeep(initialValues));
  formRef.value?.clearValidate();
}

/**
 * 关闭表单并使旧详情请求失效，保存中禁止关闭。
 */
function handleClose(): void {
  if (!isSaving.value) setModalVisible(false);
}

/**
 * 阻止遮罩和关闭按钮中断保存。
 */
function beforeClose(done: () => void): void {
  if (!isSaving.value) done();
}

/**
 * 校验并保存表单；保存中防止重复提交，失败保留输入。
 */
async function handleSubmit(): Promise<void> {
  if (
    isSaving.value ||
    isLoading.value ||
    isInitializing.value ||
    optionError.value ||
    formDisable.value ||
    hasLoadError.value
  )
    return;
  isSaving.value = true;
  formError.value = "";
  try {
    if (!(await formRef.value?.validate().catch(() => false))) return;
    const action = props.formConfig.submitForm;
    if (!action) throw new Error("请配置返回 Promise 的 submitForm");
    const payload = cloneDeep(formData);
    await props.formConfig.beforeSubmit?.(payload);
    await action(payload, getFormContext(payload));
    const message = props.formConfig.successMessage ?? "保存成功";
    if (message) ElMessage.success(message);
    isSaving.value = false;
    handleClose();
    emit("saved");
  } catch (error) {
    formError.value = error instanceof Error ? error.message : "保存失败，请重试";
  } finally {
    isSaving.value = false;
  }
}

/**
 * 读取当前模型引用或指定字段。
 */
function getFormData(): CrudRecord;
function getFormData(key: string): unknown;
function getFormData(key?: string): unknown {
  return key === undefined ? formData : formData[key];
}

/**
 * 更新一个表单字段。
 */
function setFieldValue(key: string, value: unknown): void {
  formData[key] = value;
}

/**
 * 加载字段选项；失败可重试，上一批结束前不重复加载。
 */
async function initializeFields(): Promise<void> {
  const initializers = fields.filter((field) => field.onInit);
  if (isInitializing.value || initializers.length === 0) return;
  isInitializing.value = true;
  optionError.value = "";
  const results = await Promise.allSettled(
    initializers.map((field) => Promise.resolve().then(() => field.onInit?.(field)))
  );
  const failure = results.find((result) => result.status === "rejected");
  if (failure?.status === "rejected")
    optionError.value =
      failure.reason instanceof Error ? failure.reason.message : "表单选项加载失败";
  isInitializing.value = false;
}

void initializeFields();

defineExpose({
  openForm,
  closeForm: handleClose,
  setFormData,
  loadFormData,
  getFormData,
  setFieldValue,
});
</script>
