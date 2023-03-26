<script setup lang="ts">
const { isFullscreen, toggle } = useFullscreen();
</script>

<template>
  <div>
    <svg-icon
      :icon-class="isFullscreen ? 'exit-fullscreen' : 'fullscreen'"
      @click="toggle"
    />
  </div>
</template>
