<template>
  <template v-if="tagType">
    <el-tag :type="tagType" :size="tagSize">{{ label }}</el-tag>
  </template>
  <template v-else>
    <span>{{ label }}</span>
  </template>
</template>

<script setup lang="ts">
import { useDictStore } from "@/stores";

/**
 * 字典标签：按字典值回显文本
 */
const props = defineProps({
  code: String, // 字典编码
  modelValue: [String, Number], // 字典项的值
  size: {
    type: String,
    default: "default", // 标签大小
  },
});

const dictStore = useDictStore();
const item = computed(() =>
  props.code
    ? dictStore
        .getDictItems(props.code)
        .find((entry) => String(entry.value) === String(props.modelValue))
    : undefined,
);
const label = computed(() => item.value?.label ?? "");
const tagType = computed(() => item.value?.tagType || undefined);
const tagSize = computed(() =>
  props.size === "large" || props.size === "small" ? props.size : "default",
);

watch(
  () => props.code,
  async (code) => {
    if (code) await dictStore.loadDictItems(code);
  },
  { immediate: true },
);
</script>
