<template>
  <div class="cursor-pointer w-[40px] h-[50px] leading-[50px] text-center">
    <svg-icon
      :icon-class="isFullscreen ? 'exit-fullscreen' : 'fullscreen'"
      @click="toggle"
    />
  </div>
</template>

<script setup lang="ts">
import { useFullscreen } from '@vueuse/core';
import SvgIcon from '@/components/SvgIcon/index.vue';

const { isFullscreen, toggle } = useFullscreen();
</script>
