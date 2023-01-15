<template>
  <div
    class="cursor-pointer h-[50px] leading-[50px] text-center text-[#5a5e66] px-2.5 hover:bg-gray-50"
  >
    <svg-icon
      :icon-class="isFullscreen ? 'exit-fullscreen' : 'fullscreen'"
      @click="toggle"
    />
  </div>
</template>

<script setup lang="ts">
const { isFullscreen, toggle } = useFullscreen();
</script>
