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
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

    &-left {
      display: flex;
      flex: 1;
      align-items: center;
      min-width: 0; // 允许flex收缩
      height: 100%;
      overflow: hidden; // 防止溢出

      // Logo 样式 - 使用SCSS变量管理宽度
      :deep(.logo) {
        flex-shrink: 0; // 防止Logo被压缩
        width: $sidebar-width; // 默认宽度：显示logo+文字
        height: $navbar-height;
        padding: 0;
        margin-right: 20px;
        background: transparent;

        // 中屏设备优化（800px-1100px）：适度缩小但保持显示文字
        @media (min-width: 768px) and (max-width: 1100px) {
          width: 180px; // 缩小到180px，为菜单腾出空间
          margin-right: 16px; // 减少右边距
        }

        // 小屏设备：只显示logo，使用收缩宽度
        @media (max-width: 767px) {
          width: $sidebar-width-collapsed; // 只显示logo：54px
          margin-right: 12px; // 减少右边距
        }

        a {
          height: 100%;
        }
      }
    }

    &-right {
      display: flex;
      flex-shrink: 0; // 防止操作按钮被压缩
      align-items: center;
      height: 100%;
      padding-left: 12px;
    }

    // 限制菜单高度
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

        // 响应式菜单项
        @media (min-width: 768px) and (max-width: 1200px) {
          padding: 0 12px; // 中屏设备减少内边距
          font-size: 14px; // 稍微缩小字体
        }

        @media (max-width: 767px) {
          padding: 0 8px; // 小屏设备进一步减少内边距
          font-size: 13px;
        }
      }

      .el-sub-menu {
        .el-sub-menu__title {
          height: $navbar-height;
          line-height: $navbar-height;

          @media (min-width: 768px) and (max-width: 1200px) {
            padding: 0 12px;
            font-size: 14px;
          }

          @media (max-width: 767px) {
            padding: 0 8px;
            font-size: 13px;
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

// 中屏设备的特殊优化
@media (min-width: 768px) and (max-width: 1200px) {
  .layout {
    &__header {
      padding: 0 8px; // 添加少量内边距
    }
  }
}

// 小屏设备的特殊优化
@media (max-width: 767px) {
  .layout {
    &__header {
      padding: 0 4px;
    }
  }
}
</style>
