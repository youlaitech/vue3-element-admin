<template>
  <LayoutBase>
    <!-- 顶部菜单栏 -->
    <div class="layout__header">
      <LayoutSidebar :show-logo="isShowLogo" :is-collapsed="false">
        <el-scrollbar>
          <SidebarMenu :data="routes" base-path="" menu-mode="horizontal" />
        </el-scrollbar>
        <NavbarActions />
      </LayoutSidebar>
    </div>

    <!-- 主内容区 -->
    <div :class="{ hasTagsView: isShowTagsView }" class="layout__main">
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
import NavbarActions from "@/layout/components/NavBar/components/NavbarActions.vue";
import TagsView from "@/layout/components/TagsView/index.vue";
import AppMain from "@/layout/components/AppMain/index.vue";
import SidebarMenu from "../LayoutMenu.vue";

// 布局相关参数
const { isShowTagsView, isShowLogo } = useLayout();

// 菜单相关
const { routes } = useLayoutMenu();
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

      .el-scrollbar {
        flex: 1;
        height: $navbar-height;
      }

      .el-menu-item,
      .el-sub-menu__title,
      .el-menu--horizontal {
        height: $navbar-height;
        line-height: $navbar-height;
      }
    }
  }

  &__main {
    position: relative;
    height: calc(100vh - $navbar-height);
    margin-left: 0;
    overflow-y: auto;

    .fixed-header {
      position: sticky;
      top: 0;
      z-index: 9;
    }
  }
}

:deep(.hasTagsView) {
  .app-main {
    height: calc(100vh - $navbar-height - $tags-view-height) !important;
  }
}
</style>
