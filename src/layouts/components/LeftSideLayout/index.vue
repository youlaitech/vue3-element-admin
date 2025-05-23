<template>
  <LayoutBase>
    <!-- 左侧菜单栏 -->
    <div class="layout__sidebar" :class="{ 'layout__sidebar--collapsed': !isSidebarOpen }">
      <LayoutSidebar :show-logo="isShowLogo" :is-collapsed="!isSidebarOpen">
        <el-scrollbar>
          <SidebarMenu :data="routes" base-path="" />
        </el-scrollbar>
      </LayoutSidebar>
    </div>

    <!-- 主内容区 -->
    <div
      :class="{
        hasTagsView: isShowTagsView,
        'layout__main--collapsed': !isSidebarOpen,
      }"
      class="layout__main"
    >
      <NavBar />
      <TagsView v-if="isShowTagsView" />
      <AppMain />
    </div>
  </LayoutBase>
</template>

<script setup lang="ts">
import { useLayout } from "../../composables/useLayout";
import { useLayoutMenu } from "../../composables/useLayoutMenu";
import LayoutBase from "../LayoutBase.vue";
import LayoutSidebar from "../common/LayoutSidebar.vue";
import NavBar from "@/layout/components/NavBar/index.vue";
import TagsView from "@/layout/components/TagsView/index.vue";
import AppMain from "@/layout/components/AppMain/index.vue";
import SidebarMenu from "../LayoutMenu.vue";

// 布局相关参数
const { isShowTagsView, isShowLogo, isSidebarOpen } = useLayout();

// 菜单相关
const { routes } = useLayoutMenu();
</script>

<style lang="scss" scoped>
.layout {
  &__sidebar {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 999;
    width: $sidebar-width;
    background-color: $menu-background;
    transition: width 0.28s;

    &--collapsed {
      width: $sidebar-width-collapsed;
    }
  }

  &__main {
    position: relative;
    height: 100%;
    margin-left: $sidebar-width;
    overflow-y: auto;
    transition: margin-left 0.28s;

    &--collapsed {
      margin-left: $sidebar-width-collapsed;
    }

    .fixed-header {
      position: sticky;
      top: 0;
      z-index: 9;
      transition: width 0.28s;
    }
  }
}

/* 移动端样式 */
:deep(.mobile) {
  .layout__sidebar {
    position: fixed;
    left: 0;
    transition: transform 0.28s;
  }

  &.hideSidebar {
    .layout__sidebar {
      width: $sidebar-width !important;
      transform: translateX(-$sidebar-width);
    }

    .layout__main {
      margin-left: 0 !important;
    }
  }

  .layout__main {
    margin-left: 0;
  }
}

:deep(.hasTagsView) {
  .app-main {
    height: calc(100vh - $navbar-height - $tags-view-height) !important;
  }
}
</style>
