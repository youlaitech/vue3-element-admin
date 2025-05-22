<template>
  <div class="navbar">
    <div class="flex-y-center">
      <!-- 菜单折叠按钮 -->
      <Hamburger :is-active="isSidebarOpened" @toggle-click="toggleSideBar" />
      <!-- 面包屑导航 -->
      <Breadcrumb />
    </div>
    <!-- 导航栏操作区域 -->
    <div class="navbar__actions">
      <NavbarActions />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from "@/store";
import Hamburger from "@/components/Hamburger/index.vue";
import Breadcrumb from "@/components/Breadcrumb/index.vue";
import NavbarActions from "./components/NavbarActions.vue";

const appStore = useAppStore();

// 侧边栏展开状态
const isSidebarOpened = computed(() => appStore.sidebar.opened);

// 切换侧边栏展开/折叠状态
function toggleSideBar() {
  appStore.toggleSidebar();
}
</script>

<style lang="scss" scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  height: $navbar-height;
  background: var(--el-bg-color);

  &__actions {
    display: flex;
    align-items: center;
  }
}
</style>
