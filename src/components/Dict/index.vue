<template>
  <el-select
    v-if="type === 'select'"
    v-model="selectedValue"
    :placeholder="placeholder"
    :disabled="disabled"
    clearable
    :style="style"
    @change="handleChange"
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
    v-model="selectedValue"
    :disabled="disabled"
    :style="style"
    @change="handleChange"
  >
    <el-radio
      v-for="option in options"
      :key="option.value"
      :label="option.label"
      :value="option.value"
    >
      {{ option.label }}
    </el-radio>
  </el-radio-group>

  <el-checkbox-group
    v-else-if="type === 'checkbox'"
    v-model="selectedValue"
    :disabled="disabled"
    :style="style"
    @change="handleChange"
  >
    <el-checkbox
      v-for="option in options"
      :key="option.value"
      :label="option.label"
      :value="option.value"
    >
      {{ option.label }}
    </el-checkbox>
  </el-checkbox-group>
</template>

<script setup lang="ts">
import { useDictStore } from "@/store";

const dictStore = useDictStore();

const props = defineProps({
  code: {
    type: String,
    required: true,
  },
  modelValue: {
    type: [String, Number, Array],
    required: false,
  },
  type: {
    type: String,
    default: "select",
    validator: (value: string) => ["select", "radio", "checkbox"].includes(value),
  },
  placeholder: {
    type: String,
    default: "请选择",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  style: {
    type: Object,
    default: () => {
      return {
        width: "300px",
      };
    },
  },
});

const emit = defineEmits(["update:modelValue"]);

const options = ref<Array<{ label: string; value: string | number }>>([]);

const selectedValue = ref<any>(
  typeof props.modelValue === "string" || typeof props.modelValue === "number"
    ? props.modelValue
    : Array.isArray(props.modelValue)
      ? props.modelValue
      : undefined
);

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (props.type === "checkbox") {
      selectedValue.value = Array.isArray(newValue) ? newValue : [];
    } else {
      selectedValue.value = newValue?.toString() || "";
    }
  },
  { immediate: true }
);

// 监听 options 变化并重新匹配 selectedValue
watch(
  () => options.value,
  (newOptions) => {
    // options 加载后，确保 selectedValue 可以正确匹配到 options
    if (newOptions.length > 0 && selectedValue.value !== undefined) {
      const matchedOption = newOptions.find((option) => option.value === selectedValue.value);
      if (!matchedOption && props.type !== "checkbox") {
        // 如果找不到匹配项，清空选中
        selectedValue.value = "";
      }
    }
  }
);

// 监听 selectedValue 的变化并触发 update:modelValue
function handleChange(val: any) {
  emit("update:modelValue", val);
}

// 获取字典数据
onMounted(() => {
  options.value = dictStore.getDictionary(props.code);
});
</script>
