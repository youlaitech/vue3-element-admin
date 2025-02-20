<template>
  <div @click="toggle">
    <svg-icon :icon-class="isFullscreen ? 'fullscreen-exit' : 'fullscreen'" />
  </div>
</template>

<script setup lang="ts">
const { isFullscreen, toggle } = useFullscreen();
</script>

<style lang="scss" scoped></style>
