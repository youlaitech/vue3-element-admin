<template>
  <div :class="classObj" class="app-wrapper">
    <div v-if="classObj.mobile==='mobile'&&sidebar.opened" class="drawer-bg" @click="handleClickOutside"/>
    <sidebar class="sidebar-container"/>
    <div :class="{hasTagsView:needTagsView}" class="main-container">
      <div :class="{'fixed-header':fixedHeader}">
        <navbar/>
        <tags-view v-if="needTagsView"/>
      </div>
      <app-main/>
      <!--
        <right-panel v-if="showSettings">
              <settings/>
            </right-panel>
      -->
    </div>
  </div>
</template>


<script>
import {computed, defineComponent, onBeforeMount, onBeforeUnmount, onMounted, reactive, toRefs, watch} from "vue";
import {AppMain, Navbar, Settings, Sidebar, TagsView} from './components/index.ts'
       import {useRoute} from "vue-router";
import { useAppStoreHook } from "@/store/modules/app";
import { useSettingStoreHook } from "@/store/modules/settings";
const {body} = document
const WIDTH = 992

export default defineComponent({
  name: 'Layout',
  components: {
    AppMain,
    Navbar,
    Settings,
    Sidebar,
    TagsView
  },
  setup() {
    const sidebar = computed(() => useAppStoreHook().sidebar)
    const isMobile = () => {
      const rect = body.getBoundingClientRect()
      return rect.width - 1 < WIDTH
    }

    const resizeHandler = () => {
      if (!document.hidden) {
        useAppStoreHook().toggleSidebar( isMobile() ? 'mobile' : 'desktop')
        if (isMobile()) {
          useAppStoreHook().closeSideBar({withoutAnimation: true});
        }
      }
    }

    const resizeMounted = () => {
      if (isMobile()) {
        useAppStoreHook().toggleDevice(  'mobile' )
        useAppStoreHook().toggleSidebar({withoutAnimation: true});
      }
    }
    const addEventListenerOnResize = () => {
      window.addEventListener('resize', resizeHandler)
    }

    const removeEventListenerResize = () => {
      window.removeEventListener('resize', resizeHandler)
    }

    const currentRoute = useRoute()
    const watchRouter = watch(() => currentRoute.name, () => {
      if (useAppStoreHook().device === 'mobile' && useAppStoreHook().sidebar.opened) {
        useAppStoreHook().closeSideBar(false)
      }
    })

    const state = reactive({
      handleClickOutside: () => {
        useAppStoreHook().closeSideBar(false)
      }
    })

    const classObj = computed(() => {
      return {
        hideSidebar:  !useAppStoreHook().sidebar.opened,
        openSidebar: useAppStoreHook().sidebar.opened,
        withoutAnimation: useAppStoreHook().sidebar.withoutAnimation,
        mobile: useAppStoreHook().device === 'mobile'
      }
    })
    const showSettings = computed(() => {
      return useSettingStoreHook().showSettings
    })

    const needTagsView = computed(() => {
      return useSettingStoreHook().tagsView
    })

    const fixedHeader = computed(() => {
      return useSettingStoreHook().fixedHeader
    })

    watchRouter()

    onBeforeMount(() => {
      addEventListenerOnResize()
    })

    onMounted(() => {
      resizeMounted()
    })

    onBeforeUnmount(() => {
      removeEventListenerResize()
    })

    return {
      classObj,
      showSettings,
      needTagsView,
      fixedHeader,
      sidebar,
      ...toRefs(state)
    }
  }
})

</script>
<style lang="scss" scoped>
@import "@/styles/mixin.scss";
@import "@/styles/variables.scss";

.app-wrapper {
  @include clearfix;
  position: relative;
  height: 100%;
  width: 100%;

  &.mobile.openSidebar {
    position: fixed;
    top: 0;
  }
}

.drawer-bg {
  background: #000;
  opacity: 0.3;
  width: 100%;
  top: 0;
  height: 100%;
  position: absolute;
  z-index: 999;
}

.fixed-header {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 9;
  width: calc(100% - #{$sideBarWidth});
  transition: width 0.28s;
}

.hideSidebar .fixed-header {
  width: calc(100% - 54px)
}

.mobile .fixed-header {
  width: 100%;
}
</style>
