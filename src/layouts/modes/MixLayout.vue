<template>
  <BaseLayout :show-overlay="false">
    <div v-show="!appStore.contentFullscreen" class="layout-header">
      <div class="layout-header__content">
        <div v-if="showLogo" class="layout-header__logo">
          <LayoutLogo :collapse="isLogoCollapsed" />
        </div>

        <div class="layout-header__menu">
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
                <LayoutMenuIcon :icon="item.meta.icon" />
                <span v-if="item.meta.title" class="ml-1">
                  {{ translateRouteTitle(item.meta.title) }}
                </span>
              </template>
            </el-menu-item>
          </el-menu>
        </div>

        <div class="layout-header__actions">
          <LayoutToolbar />
        </div>
      </div>
    </div>

    <div class="layout-container">
      <div
        v-show="!appStore.contentFullscreen"
        class="layout-sidebar"
        :class="{ 'is-collapsed': !isSidebarOpen }"
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
        <div class="layout-sidebar__toggle" @click="toggleSidebar">
          <div class="i-svg:arrow-left-right layout-sidebar__toggle-icon" />
        </div>
      </div>

      <div class="layout-main">
        <LayoutTagsView v-if="showTagsView" />
        <LayoutMain />
      </div>
    </div>
  </BaseLayout>
</template>

<script setup lang="ts">
import { useWindowSize } from "@vueuse/core";
import { useLayout } from "../composables/useLayout";
import { useMixMenu } from "../composables/useMixMenu";
import { useAppStore, useSettingsStore } from "@/stores";
import { translateRouteTitle } from "@/lang/utils";
import { SidebarColor, ThemeMode } from "@/enums/settings";
import BaseLayout from "../BaseLayout.vue";
import LayoutLogo from "../components/LayoutLogo.vue";
import LayoutToolbar from "../components/LayoutToolbar.vue";
import LayoutTagsView from "../components/LayoutTagsView.vue";
import LayoutMain from "../components/LayoutMain.vue";
import LayoutSidebarItem from "../components/LayoutSidebarItem.vue";
import LayoutMenuIcon from "../components/LayoutMenuIcon.vue";
import variables from "@/styles/variables.module.scss";
const { width } = useWindowSize();

const appStore = useAppStore();
const settingsStore = useSettingsStore();

const { showTagsView, showLogo, isSidebarOpen, toggleSidebar } = useLayout();

const {
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

.layout-header {
  position: sticky;
  top: 0;
  z-index: 999;
  width: 100%;
  height: $navbar-height;
  background-color: var(--menu-background);
  border-bottom: 1px solid var(--menu-border);

  &__content {
    display: flex;
    align-items: center;
    height: 100%;
    padding: 0;
  }

  &__logo {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  &__menu {
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
        padding: 0 14px;
        line-height: $navbar-height;
        border-bottom: none !important;
        border-radius: 0;
        transition:
          color 0.16s ease,
          opacity 0.16s ease;

        &::after {
          position: absolute;
          right: 16px;
          bottom: 0;
          left: 16px;
          height: 2px;
          content: "";
          background: currentcolor;
          border-radius: 999px 999px 0 0;
          opacity: 0;
          transform: scaleX(0.4);
          transition:
            opacity 0.16s ease,
            transform 0.16s ease;
        }

        &:hover {
          color: color-mix(
            in srgb,
            var(--el-color-primary) 88%,
            var(--el-text-color-primary)
          ) !important;
          background-color: transparent !important;
        }

        &.is-active {
          color: color-mix(
            in srgb,
            var(--el-color-primary) 92%,
            var(--el-text-color-primary)
          ) !important;
          background-color: transparent !important;
        }

        &.is-active::after {
          opacity: 1;
          transform: scaleX(1);
        }
      }
    }
  }

  &__actions {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    height: 100%;
    padding: 0 16px;
  }
}

.layout-container {
  @include app-main-height;
  display: flex;
  padding-top: 0;
}

.layout-sidebar {
  position: relative;
  width: $sidebar-width;
  height: 100%;
  background-color: var(--menu-background);
  border-right: 1px solid var(--menu-border);
  transition: width 0.28s;

  &.is-collapsed {
    width: $sidebar-width-collapsed !important;
    min-width: 0; // 覆盖 flex 子元素默认 min-width: auto，防止 .el-menu--collapse 64px 推挤容器
    overflow: hidden; // 裁剪 .el-menu--collapse 溢出，防止其可见溢出推挤 .layout-container 宽度
  }

  :deep(.el-scrollbar) {
    @include sidebar-scroll-height-with-toggle;

    .el-scrollbar__wrap {
      overflow-x: hidden !important;
    }

    .el-scrollbar__bar.is-horizontal {
      display: none;
    }
  }

  :deep(.el-menu) {
    height: 100%;
    border: none;
  }

  &__toggle {
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

.layout-main {
  flex: 1;
  min-width: 0;
  height: 100%;
  margin-left: 0;
  overflow-y: auto;
}

:global(html.dark),
:global(html.sidebar-color-blue) {
  .layout-header__menu {
    :deep(.el-menu--horizontal) {
      .el-menu-item {
        &:hover {
          color: color-mix(in srgb, var(--el-color-primary) 28%, var(--el-color-white)) !important;
          background-color: transparent !important;
        }

        &.is-active {
          color: color-mix(in srgb, var(--el-color-primary) 42%, var(--el-color-white)) !important;
          background-color: transparent !important;
        }
      }
    }
  }
}
</style>
