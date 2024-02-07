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

const settingsStore = useSettingsStore();
const permissionStore = usePermissionStore();
const appStore = useAppStore();
const { sidebarLogo } = settingsStore;
const layout = computed(() => settingsStore.layout);
</script>
