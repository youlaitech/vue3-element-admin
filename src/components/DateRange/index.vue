<template>
  <div>
    <el-date-picker
      v-model="startDate"
      type="date"
      placeholder="开始日期"
      :picker-options="startPickerOptions"
    />
    <el-date-picker
      v-model="endDate"
      type="date"
      placeholder="结束日期"
      :picker-options="endPickerOptions"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
  format: {
    type: String,
    default: "yyyy-MM-dd",
  },
  valueFormat: {
    type: String,
    default: "yyyy-MM-dd",
  },
});
const emit = defineEmits(["update:modelValue"]);

let startDate = computed({
  get: () => props.modelValue.startDate,
  set: (val) =>
    emit("update:modelValue", { ...props.modelValue, startDate: val }),
});

let endDate = computed({
  get: () => props.modelValue.endDate,
  set: (val) =>
    emit("update:modelValue", { ...props.modelValue, endDate: val }),
});

watch(
  [startDate, endDate],
  () => {
    if (startDate.value > endDate.value) {
      // 在这里可以添加提示代码，提醒用户开始时间不能大于结束时间
      console.log("开始时间不能大于结束时间");
    }
  },
  { immediate: true }
);

let startPickerOptions = computed(() => ({
  disabledDate: (time: any) => {
    return endDate.value ? time.getTime() > endDate.value : false;
  },
}));

let endPickerOptions = computed(() => ({
  disabledDate: (time: any) => {
    return startDate.value ? time.getTime() < startDate.value : false;
  },
}));
</script>
