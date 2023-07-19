<template>
  <div>
    <el-select
      v-model="selectedValue"
      :placeholder="placeholder"
      :disabled="disabled"
      clearable
    >
      <el-option
        v-for="option in options"
        :key="option.value"
        :label="option.label"
        :value="option.value"
      ></el-option>
    </el-select>
  </div>
</template>

<script setup lang="ts">
import { getDictOptions } from "@/api/dict";

const props = defineProps({
  typeCode: {
    type: String,
    required: true,
  },
  modelValue: {
    type: String,
    default: "",
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

const emits = defineEmits(["update:modelValue"]);

const selectedValue = useVModel(props, "modelValue", emits);

const options: Ref<OptionType[]> = ref([]);

onBeforeMount(() => {
  // 根据字典类型编码(typeCode)获取字典选项
  getDictOptions(props.typeCode).then((response) => {
    options.value = response.data;
  });
});
</script>
