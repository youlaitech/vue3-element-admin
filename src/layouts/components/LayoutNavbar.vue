<template>
  <div class="layout-navbar">
    <div class="flex-y-center">
      <Hamburger :is-active="sidebarState.opened" @toggle-click="sidebarState.toggle" />
      <Breadcrumb />
    </div>

    <div class="layout-navbar__actions">
      <LayoutToolbar />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from "@/stores";

/**
 * 顶部导航栏
 */
const props = withDefaults(
  defineProps<{
    toggleTarget?: "primary" | "secondary";
  }>(),
  {
    toggleTarget: "primary",
  },
);

const appStore = useAppStore();

const sidebarState = computed(() =>
  props.toggleTarget === "secondary"
    ? {
        opened: appStore.secondarySidebar?.opened ?? true,
        toggle: () => appStore.toggleSecondarySidebar(),
      }
    : { opened: appStore.sidebar.opened, toggle: () => appStore.toggleSidebar() },
);
</script>

<style lang="scss" scoped>
.layout-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: $navbar-height;
  padding: 0 16px 0 8px;
  background-color: var(--content-bg);
  border-bottom: 1px solid var(--border-color);

  &__actions {
    display: flex;
    align-items: center;
    height: 100%;
  }
}
</style>
