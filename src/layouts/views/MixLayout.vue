<template>
  <BaseLayout>
    <!-- 顶部菜单栏 -->
    <div class="layout__header">
      <div class="layout__header-content">
        <!-- Logo区域 -->
        <div v-if="isShowLogo" class="layout__header-logo">
          <SidebarLogo :collapse="false" />
        </div>

        <!-- 顶部菜单区域 -->
        <div class="layout__header-menu">
          <MixTopMenu />
        </div>

        <!-- 右侧操作区域 -->
        <div class="layout__header-actions">
          <NavbarActions />
        </div>
      </div>
    </div>

    <!-- 主内容区容器 -->
    <div class="layout__container">
      <!-- 左侧菜单栏 -->
      <div class="layout__sidebar--left" :class="{ 'layout__sidebar--collapsed': !isSidebarOpen }">
        <el-scrollbar>
          <el-menu
            :default-active="activeMenu"
            :collapse="!isSidebarOpen"
            :collapse-transition="false"
            :unique-opened="false"
            :background-color="variables['menu-background']"
            :text-color="variables['menu-text']"
            :active-text-color="variables['menu-active-text']"
          >
            <MenuItem
              v-for="route in sideMenuRoutes"
              :key="route.path"
              :item="route"
              :base-path="resolvePath(route.path)"
            />
          </el-menu>
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
  </BaseLayout>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useLayout } from "../composables/useLayout";
import { useLayoutMenu } from "../composables/useLayoutMenu";
import BaseLayout from "./BaseLayout.vue";
import SidebarLogo from "../components/Sidebar/components/SidebarLogo.vue";
import MixTopMenu from "../components/menu/components/MixTopMenu.vue";
import NavbarActions from "../components/navbar/components/NavbarActions.vue";
import TagsView from "../components/TagsView.vue";
import AppMain from "../components/AppMain.vue";
import MenuItem from "../components/menu/components/MenuItem.vue";
import Hamburger from "@/components/Hamburger/index.vue";
import variables from "@/styles/variables.module.scss";

const route = useRoute();

// 布局相关参数
const { isShowTagsView, isShowLogo, isSidebarOpen, toggleSidebar } = useLayout();

// 菜单相关
const { sideMenuRoutes, activeTopMenuPath } = useLayoutMenu();

// 当前激活的菜单
const activeMenu = computed(() => {
  const { meta, path } = route;
  // 如果设置了activeMenu，则使用
  if (meta?.activeMenu && typeof meta.activeMenu === "string") {
    return meta.activeMenu;
  }
  return path;
});

/**
 * 解析路径 - 混合模式下，左侧菜单是从顶级菜单下的子菜单开始的
 * 所以需要拼接顶级菜单路径
 */
function resolvePath(routePath: string) {
  // 如果已经是绝对路径，直接返回
  if (routePath.startsWith("/")) {
    return activeTopMenuPath.value + routePath;
  }
  // 否则拼接
  return `${activeTopMenuPath.value}/${routePath}`;
}

console.log("🎨 MixLayout rendered");
</script>

<style lang="scss" scoped>
.layout {
  &__header {
    position: sticky;
    top: 0;
    z-index: 999;
    width: 100%;
    height: $navbar-height;
    background-color: var(--menu-background);
    border-bottom: 1px solid var(--el-border-color-lighter);

    &-content {
      display: flex;
      align-items: center;
      height: 100%;
      padding: 0 16px;
    }

    &-logo {
      flex-shrink: 0;
      width: 200px;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;

      :deep(.logo) {
        height: 100%;

        a {
          height: 100%;
        }
      }
    }

    &-menu {
      flex: 1;
      height: 100%;
      display: flex;
      align-items: center;
      margin: 0 16px;
      overflow: hidden;

      :deep(.el-menu) {
        height: 100%;
        border: none;
        background-color: transparent;
      }

      :deep(.el-menu--horizontal) {
        display: flex;
        align-items: center;
        height: 100%;

        .el-menu-item {
          height: 100%;
          line-height: $navbar-height;
          border-bottom: none;

          &:hover {
            background-color: rgba(255, 255, 255, 0.08);
          }

          &.is-active {
            background-color: rgba(255, 255, 255, 0.12);
            border-bottom: 2px solid var(--el-color-primary);
          }
        }
      }
    }

    &-actions {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      height: 100%;
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

      &.layout__sidebar--collapsed {
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
