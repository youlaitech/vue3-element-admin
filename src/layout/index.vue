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
import {useStore} from "@store";
import {useRoute} from "vue-router";

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
    const store = useStore()

    const sidebar = computed(() => store.state.app.sidebar)
    const isMobile = () => {
      const rect = body.getBoundingClientRect()
      return rect.width - 1 < WIDTH
    }

    const resizeHandler = () => {
      if (!document.hidden) {
        store.dispatch('app/toggleDevice', isMobile() ? 'mobile' : 'desktop')
        if (isMobile()) {
          store.dispatch('app/closeSideBar', {withoutAnimation: true})
        }
      }
    }

    const resizeMounted = () => {
      if (isMobile()) {
        store.dispatch('app/toggleDevice', 'mobile')
        store.dispatch('app/closeSideBar', {withoutAnimation: true})
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
      if (store.state.app.device === 'mobile' && store.state.app.sidebar.opened) {
        store.dispatch('app/closeSideBar', false)
      }
    })

    const state = reactive({
      handleClickOutside: () => {
        store.dispatch('app/closeSideBar', false)
      }
    })

    const classObj = computed(() => {
      return {
        hideSidebar:  !store.state.app.sidebar.opened,
        openSidebar: store.state.app.sidebar.opened,
        withoutAnimation: store.state.app.sidebar.withoutAnimation,
        mobile: store.state.app.device === 'mobile'
      }
    })
    const showSettings = computed(() => {
      return store.state.settings.showSettings
    })

    const needTagsView = computed(() => {
      return store.state.settings.tagsView
    })

    const fixedHeader = computed(() => {
      return store.state.settings.fixedHeader
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
