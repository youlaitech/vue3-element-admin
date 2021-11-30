<template>
  <div :class="{'has-logo':showLogo}">
    <logo v-if="showLogo" :collapse="isCollapse"/>


    <!-- :background-color="variables.menuBg"
          :text-color="variables.menuText"
          :active-text-color="variables.menuActiveText"-->
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
          :default-active="activeMenu"
          :collapse="isCollapse"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
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

<script lang="ts">
import {computed, defineComponent} from "vue";
import SidebarItem from './SidebarItem.vue'
import Logo from './Logo.vue'
import variables from '@/styles/variables.scss'
import {useStore} from '@/store'
import {useRoute} from 'vue-router'

export default defineComponent({
  components: {
    SidebarItem,
    Logo
  },
  setup() {
    const store = useStore();
    const route = useRoute()
    const sidebar = computed(() => store.state.app.sidebar)
    const routes = computed(() => store.state.permission.routes)
    const showLogo = computed(() => store.state.settings.sidebarLogo)
    const activeMenu = computed(() => {
      const {meta, path} = route
      // if set path, the sidebar will highlight the path you set
      if (meta.activeMenu) {
        return meta.activeMenu
      }
      return path
    })
    const isCollapse = computed(() => !store.state.app.sidebar.opened)

    return {
      sidebar,
      routes,
      showLogo,
      variables,
      activeMenu,
      isCollapse,
    }
  }
})
</script>
