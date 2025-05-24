<template>
  <BaseLayout>
    <!-- 左侧菜单栏 -->
    <div class="layout__sidebar" :class="{ 'layout__sidebar--collapsed': !isSidebarOpen }">
      <Sidebar :show-logo="isShowLogo" :is-collapsed="!isSidebarOpen">
        <el-scrollbar>
          <Menu :data="routes" base-path="" />
        </el-scrollbar>
      </Sidebar>
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
  </BaseLayout>
</template>

<script setup lang="ts">
import { useLayout } from "../composables/useLayout";
import { useLayoutMenu } from "../composables/useLayoutMenu";
import BaseLayout from "./BaseLayout.vue";
import Sidebar from "../components/Sidebar/index.vue";
import NavBar from "../components/NavBar/index.vue";
import TagsView from "../components/TagsView/index.vue";
import AppMain from "../components/AppMain/index.vue";
import Menu from "../components/NavMenu/index.vue";

// 布局相关参数
const { isShowTagsView, isShowLogo, isSidebarOpen, isMobile } = useLayout();

// 菜单相关
const { routes } = useLayoutMenu();

// 添加调试日志
console.log("🔍 LeftLayout - isSidebarOpen:", isSidebarOpen.value);
console.log("🔍 LeftLayout - isMobile:", isMobile.value);
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

/* 移动端样式 - 注意这里需要正确应用到父元素 */
.mobile {
  .layout__sidebar {
    width: $sidebar-width !important;
    transition:
      transform 0.28s,
      width 0s;
  }

  &.hideSidebar {
    .layout__sidebar {
      transform: translateX(-$sidebar-width);
    }
  }

  &.openSidebar {
    .layout__sidebar {
      transform: translateX(0);
    }
  }

  .layout__main {
    margin-left: 0 !important;
  }
}

.hasTagsView {
  :deep(.app-main) {
    height: calc(100vh - $navbar-height - $tags-view-height) !important;
  }
}
</style>
