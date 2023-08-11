<script setup lang="ts">
import { useRoute } from "vue-router";
import SidebarItem from "./SidebarItem.vue";
import Logo from "./Logo.vue";

import { useSettingsStore } from "@/store/modules/settings";
import { usePermissionStore } from "@/store/modules/permission";
import { useAppStore } from "@/store/modules/app";
import { storeToRefs } from "pinia";
import variables from "@/styles/variables.module.scss";

const settingsStore = useSettingsStore();
const permissionStore = usePermissionStore();
const appStore = useAppStore();
const currRoute = useRoute();
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
  <div :class="{ 'has-logo': sidebarLogo }" class="menu-wrap">
    <logo v-if="sidebarLogo" :collapse="!appStore.sidebar.opened" />
    <el-scrollbar v-if="showContent">
      <el-menu
        :default-active="layout === 'top' ? '-' : currRoute.path"
        :collapse="!appStore.sidebar.opened"
        :background-color="variables.menuBg"
        :text-color="variables.menuText"
        :active-text-color="variables.menuActiveText"
        :unique-opened="false"
        :collapse-transition="false"
        :mode="layout === 'top' ? 'horizontal' : 'vertical'"
      >
        <sidebar-item
          v-for="route in permissionStore.routes"
          :key="route.path"
          :item="route"
          :base-path="route.path"
          :is-collapse="!appStore.sidebar.opened"
        />
      </el-menu>
    </el-scrollbar>
    <NavRight v-if="layout === 'top'" />
  </div>
</template>
<style lang="scss" scoped>
:deep(.setting-container) {
  .setting-item {
    color: #fff;
    .svg-icon {
      margin-right: 0px;
    }
    &:hover {
      color: var(--el-color-primary);
    }
  }
}
</style>
