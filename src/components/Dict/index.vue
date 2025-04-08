<template>
  <!-- Select / Select-Multiple -->
  <el-select
    v-if="['select', 'select-multiple'].includes(type)"
    v-model="selectedValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :multiple="type === 'select-multiple'"
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

  <!-- Radio -->
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

  <!-- Checkbox -->
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
import { ref, watch, onMounted } from "vue";
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
    validator: (value: string) =>
      ["select", "select-multiple", "radio", "checkbox"].includes(value),
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
    default: () => ({ width: "300px" }),
  },
});

const emit = defineEmits(["update:modelValue"]);

const options = ref<Array<{ label: string; value: string | number }>>([]);

// 动态初始化 selectedValue
const selectedValue = ref<any>(
  ["select-multiple", "checkbox"].includes(props.type)
    ? Array.isArray(props.modelValue)
      ? props.modelValue
      : []
    : (props.modelValue ?? undefined)
);

// 同步 selectedValue 与 props.modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    if (["select-multiple", "checkbox"].includes(props.type)) {
      selectedValue.value = Array.isArray(newValue) ? newValue : [];
    } else {
      selectedValue.value = newValue ?? undefined;
    }
  },
  { immediate: true }
);

// selectedValue 改变时回传给父组件
function handleChange(val: any) {
  emit("update:modelValue", val);
}

// 获取字典数据
onMounted(async () => {
  await dictStore.loadDictItems(props.code);
  options.value = dictStore.getDictItems(props.code);
});
</script>
