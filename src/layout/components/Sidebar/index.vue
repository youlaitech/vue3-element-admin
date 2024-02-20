<template>
  <div :class="{ 'has-logo': sidebarLogo }">
    <!--混合布局-->
    <div class="flex w-full" v-if="layout == 'mix'">
      <SidebarLogo v-if="sidebarLogo" :collapse="!appStore.sidebar.opened" />
      <SidebarMixTopMenu class="flex-1" />
      <NavbarRight />
    </div>
    <!--左侧布局 || 顶部布局 -->
    <template v-else>
      <SidebarLogo v-if="sidebarLogo" :collapse="!appStore.sidebar.opened" />
      <el-scrollbar>
        <SidebarMenu :menu-list="permissionStore.routes" base-path="" />
      </el-scrollbar>
      <NavbarRight v-if="layout === 'top'" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore, usePermissionStore, useAppStore } from "@/store";

const appStore = useAppStore();
const settingsStore = useSettingsStore();
const permissionStore = usePermissionStore();

const sidebarLogo = computed(() => settingsStore.sidebarLogo);
const layout = computed(() => settingsStore.layout);
</script>

<style lang="scss" scoped>
.has-logo {
  .el-scrollbar {
    height: calc(100vh - $navbar-height);
  }
}
</style>
