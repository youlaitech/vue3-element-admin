<template>
  <template v-if="Array.isArray(modelValue)">
    <el-tag
      v-for="(tag, index) in tagList"
      :key="index"
      :type="tag.tagType"
      :size="tagSize"
      class="me-1"
    >
      {{ tag.label }}
    </el-tag>
  </template>
  <template v-else>
    <el-tag v-if="tagType" :type="tagType" :size="tagSize">{{ label }}</el-tag>
    <span v-else>{{ label }}</span>
  </template>
</template>
<script setup lang="ts">
import { useDictStore } from "@/store";

const props = defineProps({
  code: String, // 字典编码
  modelValue: [String, Number, Array], // 字典项的值
  size: {
    type: String,
    default: "default", // 标签大小
  },
});
const label = ref("");
type TagType = "success" | "info" | "warning" | "danger" | "primary";
const tagType = ref<TagType | undefined>(undefined);
const tagSize = ref<"default" | "large" | "small">(props.size as "default" | "large" | "small"); // 标签大小

// 多个标签时使用
const tagList = ref<Array<{ label: string; tagType?: TagType }>>([]);

const dictStore = useDictStore();
/**
 * 根据字典项的值获取对应的 label 和 tagType
 * @param dictCode 字典编码
 * @param value 字典项的值
 * @returns 包含 label 和 tagType 的对象
 */
const getLabelAndTagByValue = async (dictCode: string, value: any) => {
  // 按需加载字典数据
  await dictStore.loadDictItems(dictCode);
  // 从缓存中获取字典数据
  const dictItems = dictStore.getDictItems(dictCode);
  // 查找对应的字典项
  const dictItem = dictItems.find((item) => item.value == value);
  return {
    label: dictItem?.label || String(value),
    tagType: dictItem?.tagType as TagType,
  };
};

const updateLabelAndTag = async () => {
  if (!props.code || props.modelValue === undefined || props.modelValue === null) return;

  await dictStore.loadDictItems(props.code);

  if (Array.isArray(props.modelValue)) {
    const results = await Promise.all(
      props.modelValue.map((val) => getLabelAndTagByValue(props.code!, val))
    );
    tagList.value = results;
  } else {
    const result = await getLabelAndTagByValue(props.code, props.modelValue);
    label.value = result.label;
    tagType.value = result.tagType as typeof tagType.value;
  }
};
watch([() => props.code, () => props.modelValue], updateLabelAndTag);

onMounted(updateLabelAndTag);
</script>
