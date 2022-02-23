<template>
  <div>
    <svg-icon :icon-class="isFullscreen ? 'exit-fullscreen' : 'fullscreen'" @click="toggle"/>
  </div>
</template>

<script setup>
import {useFullscreen} from '@vueuse/core'
import SvgIcon from '@/components/SvgIcon/index.vue'

const {isFullscreen, enter, toggle} = useFullscreen();
</script>