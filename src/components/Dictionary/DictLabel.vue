<template>
  <template v-if="tagType">
    <el-tag :type="tagType" :size="tagSize">{{ label }}</el-tag>
  </template>
  <template v-else>
    <span>{{ label }}</span>
  </template>
</template>

<script setup lang="ts">
import DictDataAPI from "@/api/dict-data";
import Cache from "@/utils/cache";
import requestCache from "@/utils/requestCache"; // 导入共享的缓存

const props = defineProps({
  code: String,
  modelValue: [String, Number],
  size: {
    type: String,
    default: "default",
  },
});

const label = ref("");
const tagType = ref<
  "success" | "warning" | "info" | "primary" | "danger" | undefined
>();

const tagSize = ref(props.size as "default" | "large" | "small");

const dictCache = new Cache("dict_");

const getLabelAndTagByValue = async (dictCode: string, value: any) => {
  // 先从本地缓存中获取字典数据
  let dictData = dictCache.getCache(dictCode);

  // 如果本地缓存没有数据，则检查是否已经发起请求
  if (!dictData) {
    if (!requestCache.has(dictCode)) {
      // 发起请求并存入请求缓存，确保后续请求能复用此 Promise
      const requestPromise = DictDataAPI.getOptions(dictCode)
        .then((data) => {
          dictCache.setCache(dictCode, data, 3 * 60 * 1000); // 缓存 3 分钟
          requestCache.delete(dictCode); // 请求完成后删除请求缓存
          return data;
        })
        .catch((error) => {
          requestCache.delete(dictCode); // 出错时也要删除缓存
          throw error;
        });

      // 将当前请求存入请求缓存
      requestCache.set(dictCode, requestPromise);
    }

    // 等待请求完成并获取数据
    dictData = await requestCache.get(dictCode);
  }

  // 查找对应的字典项
  const dictEntry = dictData.find((item: any) => item.value == value);
  return {
    label: dictEntry ? dictEntry.label : "",
    tag: dictEntry ? dictEntry.tag : undefined,
  };
};

// 监听 props 的变化，获取并更新 label 和 tag
const fetchLabelAndTag = async () => {
  const result = await getLabelAndTagByValue(
    props.code as string,
    props.modelValue
  );
  label.value = result.label;
  tagType.value = result.tag;
};

// 首次挂载时获取字典数据
onMounted(fetchLabelAndTag);

// 当 modelValue 发生变化时重新获取
watch(() => props.modelValue, fetchLabelAndTag);
</script>
