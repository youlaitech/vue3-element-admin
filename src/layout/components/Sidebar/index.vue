<template>
  <div :class="{'has-logo':showLogo}">
    <logo v-if="showLogo" :collapse="isCollapse"/>
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
          :default-active="activeMenu"
          :collapse="isCollapse"
          :background-color="variables.menuBg"
          :text-color="variables.menuText"
          :active-text-color="variables.menuActiveText"
          :unique-opened="false"
          :collapse-transition="false"
          mode="vertical">
        <sidebar-item
            v-for="route in routes"
            :item="route"
            :key="route.path"
            :base-path="route.path"
            :is-collapse="isCollapse"
        />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import {computed, defineComponent} from "vue";
import SidebarItem from './SidebarItem.vue'
import Logo from './Logo.vue'
import variables from '@/styles/variables.module.scss'
import { useSettingStoreHook } from "@/store/modules/settings";
import { useAppStoreHook } from "@/store/modules/app";
import { usePermissionStoreHook } from "@/store/modules/permission";
import {useRoute} from 'vue-router'


const route =useRoute()
const routes =computed(() => usePermissionStoreHook().routes)
const showLogo = computed(() => useSettingStoreHook().sidebarLogo)
const isCollapse = computed(() => !useAppStoreHook().sidebar.opened)

const activeMenu = computed(() => {
  const {meta, path} = route
  // if set path, the sidebar will highlight the path you set
  if (meta.activeMenu) {
    return meta.activeMenu
  }
  return path
})
</script>
