<template>
  <BaseLayout>
    <!-- 顶部菜单栏 -->
    <div class="layout__header">
      <div class="layout__header-left">
        <!-- Logo -->
        <AppLogo v-if="isShowLogo" :collapse="isLogoCollapsed" />
        <!-- 菜单 -->
        <BasicMenu :data="routes" menu-mode="horizontal" base-path="" />
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
import { computed } from "vue";
import { useWindowSize } from "@vueuse/core";
import { useLayout } from "../composables/useLayout";
import { useLayoutMenu } from "../composables/useLayoutMenu";
import BaseLayout from "./BaseLayout.vue";
import AppLogo from "../components/AppLogo/index.vue";
import BasicMenu from "../components/Menu/BasicMenu.vue";
import NavbarActions from "../components/NavBar/components/NavbarActions.vue";
import TagsView from "../components/TagsView/index.vue";
import AppMain from "../components/AppMain/index.vue";

// 布局相关参数
const { isShowTagsView, isShowLogo } = useLayout();

// 菜单相关
const { routes } = useLayoutMenu();

// 响应式窗口尺寸
const { width } = useWindowSize();

// 只有在小屏设备（移动设备）时才折叠Logo（只显示图标，隐藏文字）
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
      min-width: 0; // 允许flex收缩
      height: 100%;

      // Logo样式由AppLogo组件的全局样式控制
      :deep(.logo) {
        flex-shrink: 0; // 防止Logo被压缩
        height: $navbar-height;
      }
    }

    &-right {
      display: flex;
      flex-shrink: 0; // 防止操作按钮被压缩
      align-items: center;
      height: 100%;
      padding-left: 12px;
    }

    // 菜单样式
    :deep(.el-menu--horizontal) {
      flex: 1;
      min-width: 0; // 允许菜单收缩
      height: $navbar-height;
      overflow: hidden; // 防止菜单溢出
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

        // 父菜单激活状态 - 水平布局专用
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

// 当存在TagsView时的样式调整
.hasTagsView {
  :deep(.app-main) {
    height: calc(100vh - $navbar-height - $tags-view-height) !important;
  }
}
</style>
