<script setup lang="ts">
import Main from "./main.vue";
import { computed, watchEffect } from "vue";
import { useWindowSize } from "@vueuse/core";
import Sidebar from "./components/Sidebar/index.vue";
import LeftMenu from "./components/Sidebar/LeftMenu.vue";

import { useAppStore } from "@/store/modules/app";
import { useSettingsStore } from "@/store/modules/settings";
import { usePermissionStore } from "@/store/modules/permission";
const permissionStore = usePermissionStore();
const { width } = useWindowSize();
/**
 * 响应式布局容器固定宽度
 *
 * 大屏（>=1200px）
 * 中屏（>=992px）
 * 小屏（>=768px）
 */
const WIDTH = 992;

const appStore = useAppStore();
const settingsStore = useSettingsStore();

const activeTopMenu = computed(() => {
  return appStore.activeTopMenu;
});
// 混合模式左侧菜单
const mixLeftMenu = computed(() => {
  return permissionStore.mixLeftMenu;
});
const layout = computed(() => settingsStore.layout);
watch(
  () => activeTopMenu.value,
  (newVal) => {
    if (layout.value !== "mix") return;
    permissionStore.getMixLeftMenu(newVal);
  },
  {
    deep: true,
    immediate: true,
  }
);

const classObj = computed(() => ({
  hideSidebar: !appStore.sidebar.opened,
  openSidebar: appStore.sidebar.opened,
  withoutAnimation: appStore.sidebar.withoutAnimation,
  mobile: appStore.device === "mobile",
  isTop: layout.value === "top",
  isMix: layout.value === "mix",
}));

watchEffect(() => {
  if (width.value < WIDTH) {
    appStore.toggleDevice("mobile");
    appStore.closeSideBar(true);
  } else {
    appStore.toggleDevice("desktop");

    if (width.value >= 1200) {
      //大屏
      appStore.openSideBar(true);
    } else {
      appStore.closeSideBar(true);
    }
  }
});

function handleOutsideClick() {
  appStore.closeSideBar(false);
}

function toggleSideBar() {
  appStore.toggleSidebar();
}
</script>

<template>
  <div :class="classObj" class="app-wrapper">
    <!-- 手机设备侧边栏打开遮罩层 -->
    <div
      v-if="classObj.mobile && classObj.openSidebar"
      class="drawer-bg"
      @click="handleOutsideClick"
    ></div>

    <Sidebar class="sidebar-container" />
    <template v-if="layout === 'mix'">
      <div class="mix-wrap">
        <!-- :menu-list="mixLeftMenu -->
        <!-- :menu-list="permissionStore.routes -->
        <div class="left-wrap">
          <LeftMenu :menu-list="mixLeftMenu" :base-path="activeTopMenu" />
          <div class="menu-action">
            <hamburger
              :is-active="appStore.sidebar.opened"
              @toggle-click="toggleSideBar"
            />
          </div>
        </div>
        <Main />
      </div>
    </template>
    <Main v-else />
  </div>
</template>

<style lang="scss" scoped>
.app-wrapper {
  &::after {
    display: table;
    clear: both;
    content: "";
  }

  position: relative;
  width: 100%;
  height: 100%;

  &.mobile.openSidebar {
    position: fixed;
    top: 0;
  }
}

.drawer-bg {
  position: absolute;
  top: 0;
  z-index: 999;
  width: 100%;
  height: 100%;
  background: #000;
  opacity: 0.3;
}
// 导航栏顶部显示
.isTop {
  .sidebar-container {
    z-index: 800;
    display: flex;
    width: 100% !important;
    height: 50px;

    :deep(.logo-wrap) {
      width: $sideBarWidth;
    }

    :deep(.el-scrollbar) {
      flex: 1;
      min-width: 0;
      height: 50px;
    }
  }

  .main-container {
    padding-top: 50px;
    margin-left: 0;
  }

  // 顶部模式全局变量修改
  --el-menu-item-height: 50px;
}

.mobile.isTop {
  :deep(.logo-wrap) {
    width: 63px;
  }
}

.isMix {
  :deep(.main-container) {
    display: inline-block;
    width: calc(100% - #{$sideBarWidth});
    margin-left: 0;
  }

  .mix-wrap {
    display: flex;
    height: 100%;
    padding-top: 50px;

    .left-wrap {
      position: relative;
      height: 100%;

      .el-menu {
        height: 100%;
      }

      .menu-action {
        position: absolute;
        bottom: 0;
        width: 100%;
        height: 50px;
        line-height: 50px;
        box-shadow: 0 0 6px -2px var(--el-color-primary);

        div:hover {
          background-color: var(--menuBg);
        }

        :deep(svg) {
          color: #409eff !important;
        }
      }
    }

    .main-container {
      flex: 1;
      min-width: 0;
    }
  }
}

.openSidebar {
  .mix-wrap {
    .left-wrap {
      width: $sideBarWidth;
    }

    :deep(.svg-icon) {
      margin-top: -2px;
      margin-right: 5px;
    }

    .el-menu {
      border: none;
    }
  }
}
</style>
