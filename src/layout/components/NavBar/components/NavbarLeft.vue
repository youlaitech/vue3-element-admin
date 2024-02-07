<template>
  <div class="flex">
    <hamburger
      :is-active="appStore.sidebar.opened"
      @toggle-click="toggleSideBar"
    />
    <breadcrumb />
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from "@/store";

const appStore = useAppStore();

function toggleSideBar() {
  appStore.toggleSidebar();
}
</script>
