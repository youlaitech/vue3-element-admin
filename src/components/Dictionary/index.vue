<template>
  <div>
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
  </div>
</template>

<script setup lang="ts">
import { getDictOptions } from "@/api/dict";

const props = defineProps({
  /**
   * 字典类型编码(eg: 性别-gender)
   */
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

const emits = defineEmits(["update:modelValue"]); // 父组件监听事件，同步子组件值的变化给父组件

const options: Ref<OptionType[]> = ref([]); // 字典下拉数据源

const selectedValue = computed(() => props.modelValue.toString()); // 将父组件的值统一转化String和下拉数据源进行比较，避免值的类型不一致导致回显失败

function handleChange(val?: string) {
  emits("update:modelValue", val);
}

onBeforeMount(() => {
  // 根据字典类型编码(typeCode)获取字典选项
  getDictOptions(props.typeCode).then((response) => {
    options.value = response.data;
  });
});
</script>
