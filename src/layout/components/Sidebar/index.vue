<template>
  <div :class="{ 'has-logo': sidebarLogo }">
    <!-- 混合布局 -->
    <div v-if="layout == LayoutMode.MIX" class="flex w-full">
      <SidebarLogo v-if="sidebarLogo" :collapse="isSidebarCollapsed" />
      <SidebarMixTopMenu class="flex-1" />
      <NavbarRight />
    </div>

    <!-- 顶部布局 || 左侧布局 -->
    <template v-else>
      <SidebarLogo v-if="sidebarLogo" :collapse="isSidebarCollapsed" />
      <el-scrollbar>
        <SidebarMenu :data="permissionStore.routes" base-path="" />
      </el-scrollbar>

      <!-- 顶部导航 -->
      <NavbarRight v-if="layout == LayoutMode.TOP" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { LayoutMode } from "@/enums/settings/layout.enum";
import { useSettingsStore, usePermissionStore, useAppStore } from "@/store";

import NavbarRight from "../NavBar/components/NavbarRight.vue";

const appStore = useAppStore();
const settingsStore = useSettingsStore();
const permissionStore = usePermissionStore();

const sidebarLogo = computed(() => settingsStore.sidebarLogo);
const layout = computed(() => settingsStore.layout);

const isSidebarCollapsed = computed(() => !appStore.sidebar.opened);
</script>

<style lang="scss" scoped>
.has-logo {
  .el-scrollbar {
    height: calc(100vh - $navbar-height);
  }
}
</style>
