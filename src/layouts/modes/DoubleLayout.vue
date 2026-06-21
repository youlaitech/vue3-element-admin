<template>
  <BaseLayout>
    <aside
      v-show="!appStore.contentFullscreen"
      class="layout-double"
      :class="{ 'is-collapsed': !isSidebarOpen }"
    >
      <div class="layout-double__primary">
        <LayoutLogo v-if="showLogo" :collapse="true" />

        <el-scrollbar class="layout-double__primary-scroll">
          <button
            v-for="item in topMenuItems"
            :key="item.path"
            class="layout-double__primary-item"
            :class="{ 'is-active': item.path === activeTopMenuPath }"
            :title="item.meta?.title ? translateRouteTitle(item.meta.title) : undefined"
            type="button"
            @click="handleTopMenuSelect(item.path)"
          >
            <LayoutMenuIcon :icon="item.meta?.icon" />
            <span v-if="item.meta?.title">{{ translateRouteTitle(item.meta.title) }}</span>
          </button>
        </el-scrollbar>

        <button
          class="layout-double__primary-toggle"
          :title="isSidebarOpen ? '收起菜单' : '展开菜单'"
          type="button"
          @click="toggleSidebar"
        >
          <div class="i-svg:arrow-left-right layout-double__primary-toggle-icon" />
        </button>
      </div>

      <div class="layout-double__secondary">
        <div v-if="showLogo" class="layout-double__title">
          {{ appConfig.title }}
        </div>

        <el-scrollbar class="layout-double__secondary-scroll">
          <LayoutSidebar
            :data="sideMenuRoutes"
            :base-path="activeTopMenuPath"
            :always-expand="true"
          />
        </el-scrollbar>
      </div>
    </aside>

    <main
      class="layout-main"
      :class="{
        'is-collapsed': !isSidebarOpen,
        'is-fullscreen': appStore.contentFullscreen,
      }"
    >
      <LayoutNavbar v-show="!appStore.contentFullscreen" />
      <LayoutTagsView v-if="showTagsView" />
      <LayoutMain />
    </main>
  </BaseLayout>
</template>

<script setup lang="ts">
import { useLayout } from "../composables/useLayout";
import { useMixMenu } from "../composables/useMixMenu";
import { useAppStore } from "@/stores";
import { appConfig } from "@/settings";
import { translateRouteTitle } from "@/lang/utils";
import BaseLayout from "../BaseLayout.vue";
import LayoutLogo from "../components/LayoutLogo.vue";
import LayoutNavbar from "../components/LayoutNavbar.vue";
import LayoutTagsView from "../components/LayoutTagsView.vue";
import LayoutMain from "../components/LayoutMain.vue";
import LayoutSidebar from "../components/LayoutSidebar.vue";
import LayoutMenuIcon from "../components/LayoutMenuIcon.vue";

const appStore = useAppStore();
const { showTagsView, showLogo, isSidebarOpen, toggleSidebar } = useLayout();

const { topMenuItems, activeTopMenuPath, sideMenuRoutes, handleTopMenuSelect } = useMixMenu();
</script>

<style lang="scss" scoped>
$double-sidebar-width: $sidebar-primary-width + $sidebar-secondary-width;

.layout-double {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 999;
  display: flex;
  width: $double-sidebar-width;
  overflow: hidden;
  background-color: var(--menu-background);
  border-right: 1px solid var(--menu-border);
  transition: width 0.28s;

  &.is-collapsed {
    width: $sidebar-width-collapsed + $sidebar-secondary-width;

    .layout-double__primary {
      flex-basis: $sidebar-width-collapsed;
      width: $sidebar-width-collapsed;
    }

    .layout-double__primary-item {
      gap: 0;
      min-height: 48px;
      padding: 8px 4px;

      span {
        display: none;
      }
    }

    .layout-double__secondary {
      flex: 0 0 $sidebar-secondary-width;
      width: $sidebar-secondary-width;
      min-width: $sidebar-secondary-width;
      border-right: 1px solid var(--menu-border);
    }
  }

  &__primary {
    display: flex;
    flex: 0 0 $sidebar-primary-width;
    flex-direction: column;
    width: $sidebar-primary-width;
    overflow: hidden;
    background:
      linear-gradient(
        180deg,
        color-mix(in srgb, var(--menu-background) 94%, var(--el-color-primary) 6%),
        var(--menu-background)
      ),
      var(--menu-background);
    border-right: 1px solid var(--menu-border);
    transition:
      flex-basis 0.28s,
      width 0.28s;

    :deep(.layout-logo) {
      height: $navbar-height;
      background-color: transparent;
    }
  }

  &__primary-scroll {
    flex: 1;
    min-height: 0;
  }

  &__primary-item {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 6px;
    align-items: center;
    justify-content: center;
    width: calc(100% - 12px);
    min-height: 64px;
    padding: 8px 4px;
    margin: 6px;
    font: inherit;
    font-size: 12px;
    line-height: 1.2;
    color: var(--menu-text);
    cursor: pointer;
    background: transparent;
    border: 0;
    border-radius: 8px;
    transition:
      color 0.18s,
      background-color 0.18s;

    :deep(.layout-menu-icon) {
      width: 20px !important;
      min-width: 20px !important;
      height: 20px !important;
      font-size: 20px !important;
      color: currentcolor !important;
    }

    span {
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      text-align: center;
      white-space: nowrap;
    }

    &:hover {
      color: var(--menu-active-text);
      background-color: var(--menu-hover);
    }

    &.is-active {
      color: var(--menu-active-text);
      background-color: var(--menu-active-bg);
    }

    &:focus-visible {
      outline: none;
      background-color: var(--menu-hover);
    }
  }

  &__primary-toggle {
    display: flex;
    flex: 0 0 48px;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 0;
    font: inherit;
    color: var(--menu-text);
    cursor: pointer;
    background: transparent;
    border: none;
    border-top: 1px solid var(--menu-border);
    transition:
      color 0.18s,
      background-color 0.18s;

    &:hover {
      color: var(--menu-active-text);
      background-color: var(--menu-hover);
    }
  }

  &__primary-toggle-icon {
    width: 18px;
    height: 18px;
    font-size: 18px;
    transition: transform 0.28s;
  }

  &__secondary {
    display: flex;
    flex: 0 0 auto;
    flex-direction: column;
    width: $sidebar-secondary-width;
    min-width: 0;
    overflow: hidden;
    background-color: var(--menu-background);
    transition: width 0.28s;

    :deep(.el-menu) {
      border: none;
    }

    :deep(.el-menu-item span),
    :deep(.el-sub-menu__title span) {
      visibility: visible !important;
      width: auto !important;
      height: auto !important;
      overflow: visible !important;
    }

    :deep(.el-sub-menu__icon-arrow) {
      display: inline-flex !important;
    }
  }

  &__secondary-scroll {
    flex: 1;
    min-height: 0;
  }

  &__title {
    display: flex;
    flex: 0 0 $navbar-height;
    align-items: center;
    min-width: $sidebar-secondary-width;
    padding: 0 18px;
    font-size: 16px;
    font-weight: 600;
    color: var(--sidebar-logo-text-color);
    white-space: nowrap;
  }
}

.layout-main {
  position: relative;
  height: 100%;
  margin-left: $double-sidebar-width;
  overflow-y: auto;
  transition: margin-left 0.28s;

  &.is-collapsed {
    margin-left: $sidebar-width-collapsed + $sidebar-secondary-width;
  }

  &.is-fullscreen {
    margin-left: 0 !important;
  }
}

.is-mobile {
  .layout-double {
    width: $double-sidebar-width;
    transition:
      transform 0.28s,
      width 0s;
  }

  &.is-sidebar-collapsed {
    .layout-double {
      transform: translateX(-$double-sidebar-width);
    }
  }

  &.is-sidebar-open {
    .layout-double {
      transform: translateX(0);
    }
  }

  .layout-main {
    margin-left: 0 !important;
  }
}
</style>
