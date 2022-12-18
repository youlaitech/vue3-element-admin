<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import SidebarItem from './SidebarItem.vue';
import Logo from './Logo.vue';
import variables from '@/styles/variables.module.scss';

import { useSettingsStore } from '@/store/modules/settings';
import { usePermissionStore } from '@/store/modules/permission';
import { useAppStore } from '@/store/modules/app';
import { storeToRefs } from 'pinia';

const settingsStore = useSettingsStore();
const permissionStore = usePermissionStore();
const appStore = useAppStore();

const { sidebarLogo } = storeToRefs(settingsStore);
const route = useRoute();

const isCollapse = computed(() => !appStore.sidebar.opened);

const activeMenu = computed<string>(() => {
  const { meta, path } = route;
  if (meta?.activeMenu) {
    return meta.activeMenu as string;
  }
  return path;
});
</script>

<template>
  <div :class="{ 'has-logo': sidebarLogo }">
    <logo v-if="sidebarLogo" :collapse="isCollapse" />
    <el-scrollbar>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="variables.menuBg"
        :text-color="variables.menuText"
        :active-text-color="variables.menuActiveText"
        :unique-opened="false"
        :collapse-transition="false"
        mode="vertical"
      >
        <sidebar-item
          v-for="route in permissionStore.routes"
          :item="route"
          :key="route.path"
          :base-path="route.path"
          :is-collapse="isCollapse"
        />
      </el-menu>
    </el-scrollbar>
  </div>
</template>
