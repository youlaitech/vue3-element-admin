<template>
  <BaseLayout>
    <!-- 顶部菜单栏 -->
    <div v-show="!appStore.contentFullscreen" class="layout__header">
      <div class="layout__header-content">
        <div v-if="showLogo" class="layout__header-logo">
          <LayoutLogo :collapse="isLogoCollapsed" />
        </div>

        <!-- 顶部菜单 -->
        <div class="layout__header-menu">
          <el-menu
            mode="horizontal"
            :default-active="activeTopMenuPath"
            :background-color="useMenuColors ? variables['menu-background'] : undefined"
            :text-color="useMenuColors ? variables['menu-text'] : undefined"
            :active-text-color="useMenuColors ? variables['menu-active-text'] : undefined"
            @select="handleTopMenuSelect"
          >
            <el-menu-item v-for="item in topMenuItems" :key="item.path" :index="item.path">
              <template v-if="item.meta">
                <MenuIcon :icon="item.meta.icon" />
                <span v-if="item.meta.title" class="ml-1">
                  {{ translateRouteTitle(item.meta.title) }}
                </span>
              </template>
            </el-menu-item>
          </el-menu>
        </div>

        <div class="layout__header-actions">
          <LayoutToolbar />
        </div>
      </div>
    </div>

    <!-- 主内容区容器 -->
    <div class="layout__container">
      <!-- 左侧菜单栏 -->
      <div
        v-show="!appStore.contentFullscreen"
        class="layout__sidebar--left"
        :class="{ 'layout__sidebar--collapsed': !isSidebarOpen }"
      >
        <el-scrollbar>
          <el-menu
            :default-active="activeSideMenuPath"
            :collapse="!isSidebarOpen"
            :collapse-transition="false"
            :unique-opened="false"
            :background-color="variables['menu-background']"
            :text-color="variables['menu-text']"
            :active-text-color="variables['menu-active-text']"
          >
            <LayoutSidebarItem
              v-for="item in sideMenuRoutes"
              :key="item.path"
              :item="item"
              :base-path="resolvePath(item.path)"
            />
          </el-menu>
        </el-scrollbar>
        <div class="layout__sidebar-toggle" @click="toggleSidebar">
          <div class="i-svg:arrow-left-right layout__sidebar-toggle-icon" />
        </div>
      </div>

      <!-- 主内容区 -->
      <div :class="{ hasTagsView: showTagsView }" class="layout__main">
        <LayoutTagsView v-if="showTagsView" />
        <LayoutMain />
      </div>
    </div>
  </BaseLayout>
</template>

<script setup lang="ts">
import { useWindowSize } from "@vueuse/core";
import { useLayout } from "./useLayout";
import { useMixMenu } from "./composables/useMixMenu";
import { useAppStore, useSettingsStore } from "@/stores";
import { translateRouteTitle } from "@/lang/utils";
import { SidebarColor, ThemeMode } from "@/enums/settings";
import BaseLayout from "./BaseLayout.vue";
import LayoutLogo from "./components/LayoutLogo.vue";
import LayoutToolbar from "./components/LayoutToolbar.vue";
import LayoutTagsView from "./components/LayoutTagsView.vue";
import LayoutMain from "./components/LayoutMain.vue";
import LayoutSidebarItem from "./components/LayoutSidebarItem.vue";
import variables from "@/styles/variables.module.scss";
const { width } = useWindowSize();

const appStore = useAppStore();
const settingsStore = useSettingsStore();

const { showTagsView, showLogo, isSidebarOpen, toggleSidebar } = useLayout();

const {
  MenuIcon,
  topMenuItems,
  activeSideMenuPath,
  activeTopMenuPath,
  sideMenuRoutes,
  resolvePath,
  handleTopMenuSelect,
} = useMixMenu();

const isLogoCollapsed = computed(() => width.value < 768);

/**
 * 深色菜单配色。
 *
 * 暗色主题或经典蓝侧边栏时菜单区域使用深色背景与浅色文字，
 * 其他情况使用 Element Plus 默认配色。
 */
const useMenuColors = computed(
  () =>
    settingsStore.resolvedTheme === ThemeMode.DARK ||
    settingsStore.sidebarColorScheme === SidebarColor.CLASSIC_BLUE
);
</script>

<style lang="scss" scoped>
@use "@/styles/mixins" as *;

.layout {
  &__header {
    position: sticky;
    top: 0;
    z-index: 999;
    width: 100%;
    height: $navbar-height;
    background-color: var(--menu-background);
    border-bottom: 1px solid var(--menu-border);

    &-content {
      display: flex;
      align-items: center;
      height: 100%;
      padding: 0;
    }

    &-logo {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      height: 100%;
    }

    &-menu {
      display: flex;
      flex: 1;
      align-items: center;
      min-width: 0;
      height: 100%;
      overflow: hidden;

      :deep(.el-menu) {
        height: 100%;
        background-color: transparent;
        border: none;
      }

      :deep(.el-menu--horizontal) {
        display: flex;
        gap: 4px;
        align-items: center;
        height: 100%;

        .el-menu-item {
          position: relative;
          height: 100%;
          padding: 0 12px;
          line-height: $navbar-height;
          border-bottom: none;
          border-radius: 0;
          transition:
            color 0.16s ease,
            background-color 0.16s ease,
            border-color 0.16s ease;

          &:hover {
            background-color: var(--menu-hover) !important;
          }

          &.is-active {
            color: var(--el-color-primary) !important;
            background-color: color-mix(
              in srgb,
              var(--el-color-primary) 10%,
              var(--el-bg-color-overlay)
            ) !important;
            border-bottom: 2px solid var(--el-color-primary);
          }
        }
      }
    }

    &-actions {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      height: 100%;
      padding: 0 16px;
    }
  }

  &__container {
    @include app-main-height;
    display: flex;
    padding-top: 0;

    .layout__sidebar--left {
      position: relative;
      width: $sidebar-width;
      height: 100%;
      background-color: var(--menu-background);
      border-right: 1px solid var(--menu-border);
      transition: width 0.28s;

      &.layout__sidebar--collapsed {
        width: $sidebar-width-collapsed !important;
      }

      :deep(.el-scrollbar) {
        @include sidebar-scroll-height-with-toggle;
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
        height: $sidebar-toggle-height;
        line-height: $sidebar-toggle-height;
        cursor: pointer;
        background-color: var(--menu-background);
        border-top: 1px solid var(--menu-border);

        &-icon {
          width: 18px;
          height: 18px;
          font-size: 18px;
          color: var(--el-text-color-secondary);
          transition: color 0.16s;
        }

        &:hover &-icon {
          color: var(--el-color-primary);
        }
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
    @include app-main-height-with-tags;
  }
}

:global(html.dark),
:global(html.sidebar-color-blue) {
  .layout__header-menu {
    :deep(.el-menu--horizontal) {
      .el-menu-item.is-active {
        color: var(--menu-active-text) !important;
        background-color: color-mix(
          in srgb,
          var(--el-color-primary) 18%,
          var(--menu-background)
        ) !important;
      }
    }
  }
}
</style>
