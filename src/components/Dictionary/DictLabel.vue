<template>
  <template v-if="tag">
    <el-tag :type="tag">{{ label }}</el-tag>
  </template>
  <template v-else>
    <span>{{ label }}</span>
  </template>
</template>

<script setup lang="ts">
import DictDataAPI from "@/api/dict-data";
import Cache from "@/utils/cache";

const props = defineProps({
  dictCode: String,
  value: [String, Number],
});

const label = ref("");
const tag = ref<
  "success" | "warning" | "info" | "primary" | "danger" | undefined
>();

const dictCache = new Cache("dict_");

const getLabelAndTagByValue = async (dictCode: string, value: any) => {
  let dictData = dictCache.getCache(dictCode);
  if (!dictData) {
    dictData = await DictDataAPI.getOptions(dictCode);
    dictCache.setCache(dictCode, dictData, 3 * 60 * 1000); // 缓存 3 分钟
  }

  const dictEntry = dictData.find((item: any) => item.value == value);
  return {
    label: dictEntry ? dictEntry.label : "",
    tag: dictEntry ? dictEntry.tag : undefined,
  };
};

// 监听 props 的变化，获取并更新 label 和 tag
const fetchLabelAndTag = async () => {
  const result = await getLabelAndTagByValue(
    props.dictCode as string,
    props.value
  );
  label.value = result.label;
  tag.value = result.tag;
};

onMounted(fetchLabelAndTag);
watch(() => props.value, fetchLabelAndTag);
</script>
