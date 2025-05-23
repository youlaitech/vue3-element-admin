<template>
  <BaseLayout>
    <!-- 顶部菜单栏 -->
    <div class="layout__header">
      <Sidebar :show-logo="isShowLogo" :is-collapsed="false">
        <Menu :data="routes" menu-mode="horizontal" base-path="" />
        <NavbarActions />
      </Sidebar>
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
import Sidebar from "../components/Sidebar/index.vue";
import Menu from "../components/menu/index.vue";
import NavbarActions from "../components/navbar/components/NavbarActions.vue";
import TagsView from "../components/TagsView.vue";
import AppMain from "../components/AppMain.vue";

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
