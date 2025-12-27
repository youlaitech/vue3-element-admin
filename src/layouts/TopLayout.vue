<template>
  <BaseLayout>
    <!-- 顶部菜单�?-->
    <div class="layout__header">
      <div class="layout__header-left">
        <LayoutLogo v-if="showLogo" :collapse="isLogoCollapsed" />
        <LayoutSidebar :data="routes" menu-mode="horizontal" base-path="" />
      </div>
      <div class="layout__header-right">
        <LayoutToolbar />
      </div>
    </div>

    <!-- 主内容区 -->
    <div :class="{ hasTagsView: showTagsView }" class="layout__main">
      <LayoutTagsView v-if="showTagsView" />
      <LayoutMain />
    </div>
  </BaseLayout>
</template>

<script setup lang="ts">
import { useWindowSize } from "@vueuse/core";
import { useLayout } from "./useLayout";
import BaseLayout from "./BaseLayout.vue";
import LayoutLogo from "./components/LayoutLogo.vue";
import LayoutSidebar from "./components/LayoutSidebar.vue";
import LayoutToolbar from "./components/LayoutToolbar.vue";
import LayoutTagsView from "./components/LayoutTagsView.vue";
import LayoutMain from "./components/LayoutMain.vue";

const { showTagsView, showLogo, routes } = useLayout();
const { width } = useWindowSize();

const isLogoCollapsed = computed(() => width.value < 768);
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

    &-left {
      display: flex;
      flex: 1;
      align-items: center;
      min-width: 0;
      height: 100%;

      :deep(.logo) {
        flex-shrink: 0;
        height: $navbar-height;
      }
    }

    &-right {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      height: 100%;
      padding-left: 12px;
    }

    :deep(.el-menu--horizontal) {
      flex: 1;
      min-width: 0;
      height: $navbar-height;
      overflow: hidden;
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

        &.has-active-child {
          .el-sub-menu__title {
            color: var(--el-color-primary) !important;
            border-bottom: 2px solid var(--el-color-primary) !important;

            .menu-icon {
              color: var(--el-color-primary) !important;
            }
          }
        }
      }

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
