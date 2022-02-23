<template>
  <el-config-provider :locale="locale">
    <router-view/>
  </el-config-provider>
</template>

<script setup lang="ts">

import {computed, ref, watch} from "vue";
import {useAppStoreHook} from "@/store/modules/app";
import {ElConfigProvider} from 'element-plus'

//官方文档: https://element-plus.gitee.io/zh-CN/guide/i18n.html

// 导入 Element Plus 语言包
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'

const language = computed(() => useAppStoreHook().language)

const locale = ref()
watch(language, (value) => {
  if (value == 'en') {
    locale.value = en
  } else {
    locale.value = zhCn
  }
})
</script>
<style>
/* 表格线条对齐 */
.el-table__header col[name="gutter"] {
  display: table-cell !important;
}
</style>

