<template>
  <el-dropdown class="lang-select" trigger="click" @command="handleSetLanguage">
    <div class="lang-select__icon">
      <svg-icon class-name="international-icon" icon-class="language" />
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item :disabled="language === 'zh-cn'" command="zh-cn">
          中文
        </el-dropdown-item>
        <el-dropdown-item :disabled="language === 'en'" command="en">
          English
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import useStore from '@/store';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import SvgIcon from '@/components/SvgIcon/index.vue';

const { app } = useStore();
const language = computed(() => app.language);

const { locale } = useI18n();

function handleSetLanguage(lang: string) {
  locale.value = lang;
  app.setLanguage(lang);
  if (lang == 'en') {
    ElMessage.success('Switch Language Successful!');
  } else {
    ElMessage.success('切换语言成功！');
  }
}
</script>

<style lang="scss" scoped>
.lang-select__icon {
  line-height: 50px;
}
</style>
