<template>
  <BaseLayout>
    <!-- 顶部菜单栏 -->
    <div class="layout__header">
      <div class="layout__header-left">
        <!-- Logo -->
        <SidebarLogo v-if="isShowLogo" :collapse="false" />
        <!-- 菜单 -->
        <Menu :data="routes" menu-mode="horizontal" base-path="" />
      </div>
      <!-- 操作按钮 -->
      <div class="layout__header-right">
        <NavbarActions />
      </div>
    </div>

    <!-- 主内容区 -->
    <div :class="{ hasTagsView: isShowTagsView }" class="layout__main">
      <TagsView v-if="isShowTagsView" />
      <AppMain />
    </div>
  </BaseLayout>
</template>

<script setup lang="ts">
import { useLayout } from "../composables/useLayout";
import { useLayoutMenu } from "../composables/useLayoutMenu";
import BaseLayout from "./BaseLayout.vue";
import SidebarLogo from "../components/Sidebar/components/SidebarLogo.vue";
import Menu from "../components/NavMenu/index.vue";
import NavbarActions from "../components/NavBar/components/NavbarActions.vue";
import TagsView from "../components/TagsView/index.vue";
import AppMain from "../components/AppMain/index.vue";

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
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: $navbar-height;
    background-color: $menu-background;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

    &-left {
      display: flex;
      flex: 1;
      align-items: center;
      height: 100%;

      // Logo 样式
      :deep(.sidebar-logo) {
        width: $sidebar-width;
        height: $navbar-height;
        padding: 0;
        margin-right: 20px;
        background: transparent;

        .sidebar-logo__link {
          height: 100%;
        }

        .logo {
          width: 100%;
          background-color: transparent;
        }
      }
    }

    &-right {
      display: flex;
      align-items: center;
      height: 100%;
    }

    // 限制菜单高度
    :deep(.el-menu--horizontal) {
      flex: 1;
      height: $navbar-height;
      line-height: $navbar-height;
      background-color: transparent;
      border: none;

      .el-menu-item {
        height: $navbar-height;
        line-height: $navbar-height;
      }

      .el-sub-menu {
        .el-sub-menu__title {
          height: $navbar-height;
          line-height: $navbar-height;
        }
      }

      // 修复子菜单弹出位置
      .el-menu--popup {
        min-width: 160px;
      }
    }
  }

  &__main {
    height: calc(100vh - $navbar-height);
    overflow-y: auto;
  }
}

.hasTagsView {
  :deep(.app-main) {
    height: calc(100vh - $navbar-height - $tags-view-height) !important;
  }
}
</style>
