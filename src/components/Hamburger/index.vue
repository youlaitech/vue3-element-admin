<template>
  <div class="hamburger-wrapper" @click="toggleClick">
    <div :class="['i-svg:collapse', { hamburger: true, 'is-active': isActive }]" />
  </div>
</template>

<script setup lang="ts">
defineProps({
  isActive: {
    required: true,
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["toggleClick"]);

function toggleClick() {
  emit("toggleClick");
}
</script>

<style scoped lang="scss">
.hamburger-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 15px;

  .hamburger {
    vertical-align: middle;
    cursor: pointer;
    transform: scaleX(-1);
  }

  .hamburger.is-active {
    transform: scaleX(1);
  }
}
.layout-mix {
  .hamburger-wrapper {
    color: #fff;
  }
}
</style>
