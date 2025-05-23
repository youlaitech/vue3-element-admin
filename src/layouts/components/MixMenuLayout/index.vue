<template>
  <LayoutBase>
    <!-- 顶部菜单栏 -->
    <div class="layout__header">
      <LayoutSidebar :show-logo="isShowLogo" :is-collapsed="false">
        <SidebarMixTopMenu />
        <NavbarActions />
      </LayoutSidebar>
    </div>

    <!-- 主内容区容器 -->
    <div class="layout__container">
      <!-- 左侧菜单栏 -->
      <div class="layout__sidebar--left" :class="{ 'layout__sidebar--collapsed': !isSidebarOpen }">
        <el-scrollbar>
          <SidebarMenu :data="sideMenuRoutes" :base-path="activeTopMenuPath" />
        </el-scrollbar>
        <!-- 侧边栏切换按钮 -->
        <div class="layout__sidebar-toggle">
          <Hamburger :is-active="isSidebarOpen" @toggle-click="toggleSidebar" />
        </div>
      </div>

      <!-- 主内容区 -->
      <div :class="{ hasTagsView: isShowTagsView }" class="layout__main">
        <TagsView v-if="isShowTagsView" />
        <AppMain />
      </div>
    </div>
  </LayoutBase>
</template>

<script setup lang="ts">
import { useLayout } from "../../composables/useLayout";
import { useLayoutMenu } from "../../composables/useLayoutMenu";
import LayoutBase from "../LayoutBase.vue";
import LayoutSidebar from "../common/LayoutSidebar.vue";
import SidebarMixTopMenu from "@/layout/components/Sidebar/components/SidebarMixTopMenu.vue";
import NavbarActions from "@/layout/components/NavBar/components/NavbarActions.vue";
import TagsView from "@/layout/components/TagsView/index.vue";
import AppMain from "@/layout/components/AppMain/index.vue";
import SidebarMenu from "../LayoutMenu.vue";
import Hamburger from "@/components/Hamburger/index.vue";

// 布局相关参数
const { isShowTagsView, isShowLogo, isSidebarOpen, toggleSidebar } = useLayout();

// 菜单相关
const { sideMenuRoutes, activeTopMenuPath } = useLayoutMenu();
</script>

<style lang="scss" scoped>
.layout {
  &__header {
    position: sticky;
    top: 0;
    z-index: 999;
    width: 100%;
    height: $navbar-height;
    background-color: $menu-background;

    :deep(.layout-sidebar) {
      display: flex;
      width: 100% !important;
      height: $navbar-height;
    }
  }

  &__container {
    display: flex;
    height: calc(100vh - $navbar-height);
    padding-top: 0;

    .layout__sidebar--left {
      position: relative;
      width: $sidebar-width;
      height: 100%;
      background-color: var(--menu-background);
      transition: width 0.28s;

      &--collapsed {
        width: $sidebar-width-collapsed !important;
      }

      :deep(.el-scrollbar) {
        height: calc(100vh - $navbar-height - 50px);
      }

      :deep(.el-menu) {
        height: 100%;
        border: none;
      }

      .layout__sidebar-toggle {
        position: absolute;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 50px;
        line-height: 50px;
        box-shadow: 0 0 6px -2px var(--el-color-primary);
      }
    }

    .layout__main {
      flex: 1;
      min-width: 0;
      height: 100%;
      margin-left: 0;
      overflow-y: auto;
    }
  }
}

/* 移动端样式 */
:deep(.mobile) {
  .layout__container {
    .layout__sidebar--left {
      position: fixed;
      top: $navbar-height;
      bottom: 0;
      left: 0;
      z-index: 1000;
      transition: transform 0.28s;
    }
  }

  &.hideSidebar {
    .layout__sidebar--left {
      width: $sidebar-width !important;
      transform: translateX(-$sidebar-width);
    }
  }
}

:deep(.hasTagsView) {
  .app-main {
    height: calc(100vh - $navbar-height - $tags-view-height) !important;
  }
}
</style>
