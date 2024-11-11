<template>
  <div class="wh-full" :class="classObj">
    <!-- 遮罩层 -->
    <div
      v-if="isMobile && isOpenSidebar"
      class="wh-full fixed-lt z-999 bg-black bg-opacity-30"
      @click="handleOutsideClick"
    />

    <!-- 公用侧边栏 -->
    <Sidebar class="sidebar-container" />

    <!-- 混合布局 -->
    <div v-if="layout === LayoutEnum.MIX" class="mix-container">
      <div class="mix-container-sidebar">
        <el-scrollbar>
          <SidebarMenu :menu-list="mixLeftMenus" :base-path="activeTopMenuPath" />
        </el-scrollbar>
        <div class="sidebar-toggle">
          <hamburger :is-active="appStore.sidebar.opened" @toggle-click="toggleSidebar" />
        </div>
      </div>

      <div :class="{ hasTagsView: showTagsView }" class="main-container">
        <div :class="{ 'fixed-header': fixedHeader }">
          <TagsView v-if="showTagsView" />
        </div>
        <AppMain />
        <Settings v-if="defaultSettings.showSettings" />
        <!-- 返回顶部 -->
        <el-backtop target=".main-container">
          <svg-icon icon-class="backtop" size="24px" />
        </el-backtop>
      </div>
    </div>

    <!-- 左侧和顶部布局 -->
    <div v-else :class="{ hasTagsView: showTagsView }" class="main-container">
      <div :class="{ 'fixed-header': fixedHeader }">
        <NavBar v-if="layout === LayoutEnum.LEFT" />
        <TagsView v-if="showTagsView" />
      </div>
      <AppMain />
      <Settings v-if="defaultSettings.showSettings" />
      <!-- 返回顶部 -->
      <el-backtop target=".main-container">
        <svg-icon icon-class="backtop" size="24px" />
      </el-backtop>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppStore, useSettingsStore, usePermissionStore } from "@/store";
import defaultSettings from "@/settings";
import { DeviceEnum } from "@/enums/DeviceEnum";
import { LayoutEnum } from "@/enums/LayoutEnum";

import NavBar from "./components/NavBar/index.vue";

const appStore = useAppStore();
const settingsStore = useSettingsStore();
const permissionStore = usePermissionStore();
const width = useWindowSize().width;

const WIDTH_DESKTOP = 992; // 响应式布局容器固定宽度  大屏（>=1200px） 中屏（>=992px） 小屏（>=768px）
const isMobile = computed(() => appStore.device === DeviceEnum.MOBILE);
const isOpenSidebar = computed(() => appStore.sidebar.opened);
const fixedHeader = computed(() => settingsStore.fixedHeader); // 是否固定header
const showTagsView = computed(() => settingsStore.tagsView); // 是否显示tagsView
const layout = computed(() => settingsStore.layout); // 布局模式 left top mix
const activeTopMenuPath = computed(() => appStore.activeTopMenuPath); // 顶部菜单激活path
const mixLeftMenus = computed(() => permissionStore.mixLeftMenus); // 混合布局左侧菜单

watch(
  () => activeTopMenuPath.value,
  (newVal: string) => {
    permissionStore.setMixLeftMenus(newVal);
  },
  {
    deep: true,
    immediate: true,
  }
);

const classObj = computed(() => ({
  hideSidebar: !appStore.sidebar.opened,
  openSidebar: appStore.sidebar.opened,
  mobile: appStore.device === DeviceEnum.MOBILE,
  [`layout-${settingsStore.layout}`]: true,
}));

watchEffect(() => {
  appStore.toggleDevice(width.value < WIDTH_DESKTOP ? DeviceEnum.MOBILE : DeviceEnum.DESKTOP);
  if (width.value >= WIDTH_DESKTOP) {
    appStore.openSideBar();
  } else {
    appStore.closeSideBar();
  }
});

function handleOutsideClick() {
  appStore.closeSideBar();
}

function toggleSidebar() {
  appStore.toggleSidebar();
}

const route = useRoute();
watch(route, () => {
  if (isMobile.value && isOpenSidebar.value) {
    appStore.closeSideBar();
  }
});
</script>

<style lang="scss" scoped>
.sidebar-container {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 999;
  width: $sidebar-width;
  background-color: $menu-background;
  transition: width 0.28s;

  :deep(.el-menu) {
    border: none;
  }
}

.main-container {
  position: relative;
  height: 100%;
  margin-left: $sidebar-width;
  overflow-y: auto;
  transition: margin-left 0.28s;

  .fixed-header {
    position: sticky;
    top: 0;
    z-index: 9;
    transition: width 0.28s;
  }
}

.layout-top {
  .sidebar-container {
    position: sticky;
    z-index: 999;
    display: flex;
    width: 100% !important;
    height: $navbar-height;

    :deep(.el-scrollbar) {
      flex: 1;
      height: $navbar-height;
    }

    :deep(.el-menu-item),
    :deep(.el-sub-menu__title),
    :deep(.el-menu--horizontal) {
      height: $navbar-height;
      line-height: $navbar-height;
    }

    :deep(.el-menu--collapse) {
      width: 100%;
    }
  }

  .main-container {
    height: calc(100vh - $navbar-height);
    margin-left: 0;
  }
}

.layout-mix {
  .sidebar-container {
    width: 100% !important;
    height: $navbar-height;

    :deep(.el-scrollbar) {
      flex: 1;
      height: $navbar-height;
    }

    :deep(.el-menu-item),
    :deep(.el-sub-menu__title),
    :deep(.el-menu--horizontal) {
      height: $navbar-height;
      line-height: $navbar-height;
    }

    :deep(.el-menu--horizontal.el-menu) {
      border: none;
    }
  }

  .mix-container {
    display: flex;
    height: 100%;
    padding-top: $navbar-height;

    .mix-container-sidebar {
      position: relative;
      width: $sidebar-width;
      height: 100%;
      background-color: var(--menu-background);

      :deep(.el-scrollbar) {
        // 50px 是底部收缩按钮的高度
        height: calc(100vh - $navbar-height - 50px);
      }

      :deep(.el-menu) {
        height: 100%;
        border: none;
      }

      .sidebar-toggle {
        position: absolute;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 50px;
        line-height: 50px;
        box-shadow: 0 0 6px -2px var(--el-color-primary);

        div:hover {
          background-color: var(--menu-background);
        }

        :deep(svg) {
          color: var(--el-color-primary) !important;
        }
      }
    }

    .main-container {
      flex: 1;
      min-width: 0;
      margin-left: 0;
    }
  }
}

.hideSidebar {
  .main-container {
    margin-left: $sidebar-width-collapsed;
  }

  &.layout-top {
    .main-container {
      margin-left: 0;
    }
  }

  &.layout-mix {
    .sidebar-container {
      width: 100% !important;
    }

    .mix-container {
      &-sidebar {
        width: $sidebar-width-collapsed;
      }
    }
  }
}

.layout-left.hideSidebar {
  .sidebar-container {
    width: $sidebar-width-collapsed !important;
  }

  .main-container {
    margin-left: $sidebar-width-collapsed;
  }

  &.mobile {
    .sidebar-container {
      pointer-events: none;
      transition-duration: 0.3s;
      transform: translate3d(-210px, 0, 0);
    }

    .main-container {
      margin-left: 0;
    }
  }
}

.mobile {
  .main-container {
    margin-left: 0;
  }

  &.layout-top {
    // 顶部模式全局变量修改
    --el-menu-item-height: $navbar-height;
  }
}
</style>
