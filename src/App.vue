<template>
  <el-config-provider :locale="locale">
    <router-view />
  </el-config-provider>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { ElConfigProvider } from "element-plus";

import { localStorage } from "@/utils/storage";
import useStore from "@/store";

//官方文档: https://element-plus.gitee.io/zh-CN/guide/i18n.html

// 导入 Element Plus 语言包
import zhCn from "element-plus/es/locale/lang/zh-cn";
import en from "element-plus/es/locale/lang/en";

const { app } = useStore();
const language = computed(() => app.language);

const locale = ref();
watch(
  language,
  (value) => {
    if (value == "en") {
      locale.value = en;
    } else {
      locale.value = zhCn;
    }
  },
  {
    // 初始化立即执行，
    immediate: true,
  }
);
onMounted(() => {
  const style = localStorage.get("style");
  document.documentElement.style.cssText = style as string;
});
</script>

