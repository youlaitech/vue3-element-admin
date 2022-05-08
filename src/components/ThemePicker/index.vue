<template>
  <el-color-picker
    v-model="theme"
    :predefine="[
      '#409EFF',
      '#1890ff',
      '#304156',
      '#212121',
      '#11a983',
      '#13c2c2',
      '#6959CD',
      '#f5222d'
    ]"
    class="theme-picker"
    popper-class="theme-picker-dropdown"
  />
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import useStore from '@/store';
import { localStorage } from '@/utils/storage';

// 参考连接:https://juejin.cn/post/7024025899813044232#heading-1
import { mix } from '@/utils';
// 白色混合色
const mixWhite = '#ffffff';
// 黑色混合色
const mixBlack = '#000000';

const node = document.documentElement;

const { setting } = useStore();
const theme = computed(() => setting.theme);

watch(theme, (color: string) => {
  node.style.setProperty('--el-color-primary', color);
  localStorage.set('theme', color);

  for (let i = 1; i < 10; i += 1) {
    node.style.setProperty(
      `--el-color-primary-light-${i}`,
      mix(color, mixWhite, i * 0.1)
    );
  }
  node.style.setProperty('--el-color-primary-dark', mix(color, mixBlack, 0.1));

  localStorage.set('style', node.style.cssText);
});
</script>

<style>
.theme-message,
.theme-picker-dropdown {
  z-index: 99999 !important;
}

.theme-picker .el-color-picker__trigger {
  height: 26px !important;
  width: 26px !important;
  padding: 2px;
}

.theme-picker-dropdown .el-color-dropdown__link-btn {
  display: none;
}
</style>
