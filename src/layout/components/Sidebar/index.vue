<template>
  <div :class="{'has-logo':showLogo}">
    <logo v-if="showLogo" :collapse="isCollapse"/>
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
          :default-active="activeMenu"
          :collapse="isCollapse"
          :background-color="variables.menuBg"
          :text-color="variables.menuText"
          :unique-opened="false"
          :active-text-color="variables.menuActiveText"
          :collapse-transition="false"
          mode="vertical"
      >
        <sidebar-item v-for="route in routes" :key="route.path" :item="route"
                      :base-path="route.path"/>
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script>
import {computed, defineComponent} from "vue";
import SidebarItem from './SidebarItem.vue'
import Logo from './Logo.vue'
import variables from '@styles/variables.scss'
import {useStore} from '@/store'
import {useRoute} from 'vue-router'


export default defineComponent({
  components: {
    SidebarItem,
    Logo
  },
  setup() {
    const store = useStore()
    const route = useRoute()
    const sidebar = computed(() => {
      return store.state.app.sidebar
    })
    const routes = computed(() => {
      return store.state.permission.routes
    })
    const showLogo = computed(() => {
      return store.state.settings.sidebarLogo
    })
    const activeMenu = computed(() => {
      const {meta, path} = route
      // if set path, the sidebar will highlight the path you set
      if (meta.activeMenu) {
        return meta.activeMenu
      }
      return path
    })
    const isCollapse = computed(() => {
      return !sidebar.value.opened
    })

    return {
      sidebar,
      routes,
      showLogo,
      variables,
      activeMenu,
      isCollapse
    }
  }
})
</script>
