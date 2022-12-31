<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import SvgIcon from '@/components/SvgIcon/index.vue';
import { useAppStore } from '@/store/modules/app';

const appStore = useAppStore();
const { locale } = useI18n();

function handleLanguageChange(lang: string) {
  locale.value = lang;
  appStore.changeLanguage(lang);
  if (lang == 'en') {
    ElMessage.success('Switch Language Successful!');
  } else {
    ElMessage.success('切换语言成功！');
  }
}
</script>

<template>
  <el-dropdown
    class="lang-select"
    trigger="click"
    @command="handleLanguageChange"
  >
    <div class="cursor-pointer w-[40px] h-[50px] leading-[50px] text-center">
      <svg-icon class-name="international-icon" icon-class="language" />
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          :disabled="appStore.language === 'zh-cn'"
          command="zh-cn"
        >
          中文
        </el-dropdown-item>
        <el-dropdown-item :disabled="appStore.language === 'en'" command="en">
          English
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>
