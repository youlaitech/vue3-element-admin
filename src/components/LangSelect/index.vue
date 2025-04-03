<template>
  <el-dropdown trigger="click" @command="handleLanguageChange">
    <div class="i-svg:language" :class="size" />
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="item in langOptions"
          :key="item.value"
          :disabled="appStore.language === item.value"
          :command="item.value"
        >
          {{ item.label }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { useAppStore } from "@/store/modules/app.store";
import { LanguageEnum } from "@/enums/settings/locale.enum";

defineProps({
  size: {
    type: String,
    required: false,
  },
});

const langOptions = [
  { label: "中文", value: LanguageEnum.ZH_CN },
  { label: "English", value: LanguageEnum.EN },
];

const appStore = useAppStore();
const { locale, t } = useI18n();

/**
 * 处理语言切换
 *
 * @param lang  语言（zh-cn、en）
 */
function handleLanguageChange(lang: string) {
  locale.value = lang;
  appStore.changeLanguage(lang);

  ElMessage.success(t("langSelect.message.success"));
}
</script>
