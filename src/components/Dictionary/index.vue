<template>
  <el-select
    v-model="selectedValue"
    :placeholder="placeholder"
    :disabled="disabled"
    clearable
    @change="handleChange"
  >
    <el-option
      v-for="option in options"
      :key="option.value"
      :label="option.label"
      :value="option.value"
    />
  </el-select>
</template>

<script setup lang="ts">
import DictDataAPI from "@/api/dict-data";

const props = defineProps({
  code: {
    type: String,
    required: true,
  },
  modelValue: {
    type: [String, Number],
    required: true,
  },
  placeholder: {
    type: String,
    default: "请选择",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

// 使用 defineEmits 声明 emits
const emit = defineEmits(["update:modelValue"]);

// 下拉框选项
const options = ref<Array<{ label: string; value: string | number }>>([]);
const selectedValue = ref<string | number | undefined>(props.modelValue);

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (newValue) => {
    // 类型转换确保 selectedValue 和 option.value 类型一致
    if (typeof options.value[0]?.value === "number") {
      selectedValue.value = Number(newValue);
    } else {
      selectedValue.value = String(newValue);
    }
  }
);

// 监听 selectedValue 的变化并触发 update:modelValue
function handleChange(val?: string | number) {
  emit("update:modelValue", val);
}

// 获取字典数据
onBeforeMount(async () => {
  const data = await DictDataAPI.getOptions(props.code);
  options.value = data;
  // 初次加载时处理类型一致性
  if (props.modelValue !== undefined) {
    if (typeof options.value[0]?.value === "number") {
      selectedValue.value = Number(props.modelValue);
    } else {
      selectedValue.value = String(props.modelValue);
    }
  }
});
</script>
