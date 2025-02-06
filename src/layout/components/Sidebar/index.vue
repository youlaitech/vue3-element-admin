<template>
  <div :class="{ 'has-logo': sidebarLogo }">
    <!-- 混合 -->
    <div v-if="isMixLayout" class="flex w-full">
      <SidebarLogo v-if="sidebarLogo" :collapse="isSidebarCollapsed" />
      <SidebarMixTopMenu class="flex-1" />
      <NavbarRight />
    </div>

    <!-- 顶部 || 左侧 -->
    <template v-else>
      <SidebarLogo v-if="sidebarLogo" :collapse="isSidebarCollapsed" />
      <el-scrollbar>
        <SidebarMenu :data="permissionStore.routes" base-path="" />
      </el-scrollbar>

      <!-- 顶部导航 -->
      <NavbarRight v-if="isTopLayout" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { LayoutEnum } from "@/enums/LayoutEnum";
import { useSettingsStore, usePermissionStore, useAppStore } from "@/store";

import NavbarRight from "../NavBar/components/NavbarRight.vue";

const appStore = useAppStore();
const settingsStore = useSettingsStore();
const permissionStore = usePermissionStore();

const sidebarLogo = computed(() => settingsStore.sidebarLogo);
const layout = computed(() => settingsStore.layout);

const isMixLayout = computed(() => layout.value === LayoutEnum.MIX);
const isTopLayout = computed(() => layout.value === LayoutEnum.TOP);
const isSidebarCollapsed = computed(() => !appStore.sidebar.opened);
</script>

<style lang="scss" scoped>
.has-logo {
  .el-scrollbar {
    height: calc(100vh - $navbar-height);
  }
}
</style>
