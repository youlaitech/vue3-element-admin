<template>
  <div class="menu-toggle-button" @click="toggleClick">
    <svg-icon
      class="menu-toggle-button__icon"
      :class="{ 'is-active': isActive }"
      icon-class="shrink"
    />
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
.menu-toggle-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px;
  cursor: pointer;
  transition: background-color 0.3s;

  :hover {
    background-color: var(--el-fill-color);
  }

  &--active {
    background-color: var(--el-fill-color-light);
  }

  &__icon {
    &.is-active {
      transform: rotate(180deg);
    }
  }
}
</style>
