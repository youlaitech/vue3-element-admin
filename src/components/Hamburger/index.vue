<template>
  <div class="hamburger-wrapper" @click="toggleClick">
    <div :class="['i-svg:collapse', { hamburger: true, 'is-active': isActive }, hamburgerClass]" />
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from "@/stores";
import { ThemeMode, SidebarColor, LayoutMode } from "@/enums/settings";

defineProps({
  isActive: { type: Boolean, required: true },
});

const emit = defineEmits(["toggleClick"]);

const settingsStore = useSettingsStore();
const layout = computed(() => settingsStore.layout);

const hamburgerClass = computed(() => {
  if (settingsStore.resolvedTheme === ThemeMode.DARK) {
    return "hamburger--white";
  }

  if (
    layout.value === LayoutMode.MIX &&
    settingsStore.sidebarColorScheme === SidebarColor.CLASSIC_BLUE
  ) {
    return "hamburger--white";
  }

  return "";
});

function toggleClick() {
  emit("toggleClick");
}
</script>

<style scoped lang="scss">
.hamburger-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 100%;
  padding: 0;
  color: var(--el-text-color-regular);
  cursor: pointer;

  .hamburger {
    width: 16px;
    height: 16px;
    font-size: 16px;
    vertical-align: middle;
    color: currentcolor;
    background-color: currentcolor;
    transform: scaleX(-1);
    transition:
      color 0.16s,
      transform 0.3s ease;

    &--white {
      color: #fff;
    }

    &.is-active {
      transform: scaleX(1);
    }
  }

  &:hover {
    color: var(--el-color-primary);
  }
}
</style>
