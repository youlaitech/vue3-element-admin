<template>
  <el-select
    v-if="type === 'select'"
    v-model="selectedSingle"
    :placeholder="placeholder"
    :disabled="disabled"
    clearable
    :style="style"
  >
    <el-option
      v-for="option in options"
      :key="option.value"
      :label="option.label"
      :value="option.value"
    />
  </el-select>

  <el-radio-group
    v-else-if="type === 'radio'"
    v-model="selectedSingle"
    :disabled="disabled"
    :style="style"
  >
    <el-radio v-for="option in options" :key="option.value" :value="option.value">
      {{ option.label }}
    </el-radio>
  </el-radio-group>

  <el-checkbox-group
    v-else-if="type === 'checkbox'"
    v-model="selectedMulti"
    :disabled="disabled"
    :style="style"
  >
    <el-checkbox v-for="option in options" :key="option.value" :value="option.value">
      {{ option.label }}
    </el-checkbox>
  </el-checkbox-group>
</template>

<script setup lang="ts">
import { useDictStore } from "@/stores";

defineOptions({
  name: "DictSelect",
});

const props = defineProps({
  /** 字典编码 */
  code: {
    type: String,
    required: true,
  },
  /** 展示形态（下拉/单选/多选） */
  type: {
    type: String,
    default: "select",
    validator: (value: string) => ["select", "radio", "checkbox"].includes(value),
  },
  /** 提示文字 */
  placeholder: {
    type: String,
    default: "请选择",
  },
  /** 是否禁用（form-create 只读回显依赖此属性） */
  disabled: {
    type: Boolean,
    default: false,
  },
  /** 行内样式（默认宽度 300px） */
  style: {
    type: Object,
    default: () => {
      return {
        width: "300px",
      };
    },
  },
});

const modelValue = defineModel<string | number | Array<string | number>>();

const dictStore = useDictStore();

/** 字典选项 */
const options = ref<Array<{ label: string; value: string | number }>>([]);

/**
 * 单选值（select/radio）：选项加载后把外部值翻译为选项的原始值（消除 "1" 与 1 的
 * 字符串/数字差异），未命中时原样保留不清空；用户选择直接写回 modelValue
 */
const selectedSingle = computed<string | number | undefined>({
  get() {
    const value = modelValue.value;
    if (value === null || value === undefined || Array.isArray(value)) return undefined;
    const matched = options.value.find((option) => String(option.value) === String(value));
    return matched?.value ?? value;
  },
  set(value) {
    modelValue.value = value;
  },
});

/** 多选值（checkbox）：非数组入参按空选处理 */
const selectedMulti = computed<Array<string | number>>({
  get() {
    return Array.isArray(modelValue.value) ? modelValue.value : [];
  },
  set(value) {
    modelValue.value = value;
  },
});

// 获取字典数据（空编码跳过：设计器画布上未配置字典编码时不发无效请求；
// watch 而非 onMounted：设计器右侧面板修改编码后画布即时刷新选项）
watch(
  () => props.code,
  async (code) => {
    if (!code) {
      options.value = [];
      return;
    }
    await dictStore.loadDictItems(code);
    options.value = dictStore.getDictItems(code);
  },
  { immediate: true }
);
</script>
