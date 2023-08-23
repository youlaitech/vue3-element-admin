<script setup lang="ts">
import TopMenu from "./TopMenu.vue";
import LeftMenu from "./LeftMenu.vue";
import Logo from "./Logo.vue";
import { useSettingsStore } from "@/store/modules/settings";
import { usePermissionStore } from "@/store/modules/permission";
import { useAppStore } from "@/store/modules/app";
import { storeToRefs } from "pinia";

const settingsStore = useSettingsStore();
const permissionStore = usePermissionStore();
const appStore = useAppStore();
const { sidebarLogo } = storeToRefs(settingsStore);
const layout = computed(() => settingsStore.layout);
const showContent = ref(true);
watch(
  () => layout.value,
  () => {
    showContent.value = false;
    nextTick(() => {
      showContent.value = true;
    });
  }
);
</script>

<template>
  <div
    :class="{ 'has-logo': sidebarLogo }"
    class="menu-wrap"
    v-if="layout !== 'mix'"
  >
    <logo v-if="sidebarLogo" :collapse="!appStore.sidebar.opened" />
    <el-scrollbar v-if="showContent">
      <LeftMenu :menu-list="permissionStore.routes" base-path="" />
    </el-scrollbar>
    <NavRight v-if="layout === 'top'" />
  </div>
  <template v-else>
    <div :class="{ 'has-logo': sidebarLogo }" class="menu-wrap">
      <div class="header">
        <logo v-if="sidebarLogo" :collapse="!appStore.sidebar.opened" />
        <TopMenu />
        <NavRight />
      </div>
    </div>
  </template>
</template>
<style lang="scss" scoped>
:deep(.setting-container) {
  .setting-item {
    color: #fff;

    .svg-icon {
      margin-right: 0;
    }

    &:hover {
      color: var(--el-color-primary);
    }
  }
}

.isMix {
  .menu-wrap {
    z-index: 99;
    width: 100% !important;
    height: 50px;
    background-color: $menuBg;

    :deep(.header) {
      display: flex;
      width: 100%;
      // 顶部模式全局变量修改
      --el-menu-item-height: 50px;

      .logo-wrap {
        width: $sideBarWidth;
      }

      .el-menu {
        background-color: $menuBg;

        .el-menu-item {
          color: $menuText;
        }
      }

      .el-scrollbar {
        flex: 1;
        min-width: 0;
        height: 50px;
      }
    }
  }

  .left-menu {
    display: inline-block;
    width: $sideBarWidth;
    background-color: $menuBg;

    :deep(.el-menu) {
      background-color: $menuBg;

      .el-menu-item {
        color: $menuText;
      }
    }
  }
}
</style>
