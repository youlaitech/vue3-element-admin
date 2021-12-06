<template>
  <div id="tags-view-container" class="tags-view-container">
    <scroll-pane ref="scrollPane" class="tags-view-wrapper" @scroll="handleScroll">
      <router-link
          v-for="tag in visitedViews"
          ref="tag"
          :key="tag.path"
          :class="isActive(tag)?'active':''"
          :to="{ path: tag.path, query: tag.query, fullPath: tag.fullPath }"
          tag="span"
          class="tags-view-item"
          @click.middle.native="!isAffix(tag)?closeSelectedTag(tag):''"
          @contextmenu.prevent.native="openMenu(tag,$event)"
      >
        {{ tag.meta.title }}
        <span v-if="!isAffix(tag)" @click.prevent.stop="closeSelectedTag(tag)">
          <el-icon :size="8">
           <close />
          </el-icon>
        </span>
      </router-link>
    </scroll-pane>
    <ul v-show="visible" :style="{left:left+'px',top:top+'px'}" class="contextmenu">
      <li @click="refreshSelectedTag(selectedTag)">刷新</li>
      <li v-if="!isAffix(selectedTag)" @click="closeSelectedTag(selectedTag)">关闭</li>
      <li @click="closeOthersTags">关闭其它</li>
      <li @click="closeAllTags(selectedTag)">关闭所有</li>
    </ul>
  </div>
</template>

<script lang="ts">

import {Close} from '@element-plus/icons'

import ScrollPane from './ScrollPane.vue'
import path from 'path-browserify'
import {useStore} from "@store";
import {
  defineComponent,
  computed,
  getCurrentInstance,
  nextTick,
  onBeforeMount,
  reactive,
  ref,
  toRefs,
  watch
} from "vue";
import {RouteRecordRaw, useRoute, useRouter} from 'vue-router'
import {TagView} from "@store/interface";

export default defineComponent({
  components: {ScrollPane,Close},
  setup() {
    const store = useStore()
    const router = useRouter()
    const instance = getCurrentInstance()
    const currentRoute = useRoute()
    const scrollPaneRef = ref(null)
    const {ctx} = instance as any

    const toLastView=(visitedViews:TagView[],view:TagView)=>{
      const latestView = visitedViews.slice(-1)[0]
      if (latestView && latestView.fullPath) {
        router.push(latestView.fullPath)
      } else {
        if (view.name === 'Dashboard') {
          router.push({path: '/redirect' + view.fullPath})
        } else {
          router.push('/')
        }
      }
    }

    const state =reactive({
      visible: false,
      top: 0,
      left: 0,
      selectedTag: {} as TagView,
      affixTags: [] as TagView[],
      isActive: (route:TagView) => {
        return route.path === currentRoute.path
      },
      isAffix: (tag:TagView) => {
        return tag.meta && tag.meta.affix
      },
      refreshSelectedTag: (view: TagView) => {
        store.dispatch('tagsView/delCachedView', view)
        const { fullPath } = view
        nextTick(() => {
          router.replace({ path: '/redirect' + fullPath }).catch(err => {
            console.warn(err)
          })
        })
      },
      closeSelectedTag: (view: TagView) => {
        store.dispatch('tagsView/delView', view)
        if (state.isActive(view)) {
          toLastView(store.state.tagsView.visitedViews, view)
        }
      },
      closeOthersTags: () => {
        if (state.selectedTag.fullPath !== currentRoute.path && state.selectedTag.fullPath !== undefined) {
          router.push(state.selectedTag.fullPath)
        }
        store.dispatch('tagsView/delOthersViews', state.selectedTag as TagView)
      },
      closeAllTags: (view: TagView) => {
        store.dispatch('tagsView/delAllViews', undefined)
        if (state.affixTags.some(tag => tag.path === currentRoute.path)) {
          return
        }
        toLastView(store.state.tagsView.visitedViews, view)
      },
      openMenu: (tag: TagView, e: MouseEvent) => {
        const menuMinWidth = 105
        const offsetLeft = ctx.$el.getBoundingClientRect().left // container margin left
        const offsetWidth = ctx.$el.offsetWidth // container width
        const maxLeft = offsetWidth - menuMinWidth // left boundary
        const left = e.clientX - offsetLeft + 15 // 15: margin right
        if (left > maxLeft) {
          state.left = maxLeft
        } else {
          state.left = left
        }
        state.top = e.clientY
        state.visible = true
        state.selectedTag = tag
      },
      closeMenu: () => {
        state.visible = false
      },
      handleScroll: () => {
        state.closeMenu()
      }

    })

    const visitedViews = computed(() => {
      return store.state.tagsView.visitedViews
    })
    const routes = computed(() => store.state.permission.routes)

    const filterAffixTags = (routes: RouteRecordRaw[], basePath = '/') => {
      let tags: TagView[] = []

      routes.forEach(route => {
        if (route.meta && route.meta.affix) {
          const tagPath = path.resolve(basePath, route.path)
          tags.push({
            fullPath: tagPath,
            path: tagPath,
            name: route.name,
            meta: { ...route.meta }
          })
        }

        if (route.children) {
          const childTags = filterAffixTags(route.children, route.path)
          if (childTags.length >= 1) {
            tags = tags.concat(childTags)
          }
        }
      })
      return tags
    }

    const initTags = () => {
      state.affixTags = filterAffixTags(routes.value)
      for (const tag of state.affixTags) {
        // Must have tag name
        if (tag.name) {
          store.dispatch('tagsView/addVisitedView', tag as TagView)
        }
      }
    }

    const addTags = () => {
      if (currentRoute.name) {
        store.dispatch('tagsView/addView', currentRoute)
      }
      return false
    }

    const moveToCurrentTag = () => {
      const tags = instance?.refs.tag as any[]
      nextTick(() => {
        if (tags === null || tags === undefined || !Array.isArray(tags)) { return }
        for (const tag of tags) {
          if ((tag.to as TagView).path === currentRoute.path) {
            (scrollPaneRef.value as any).moveToCurrentTag(tag)
            // When query is different then update
            if ((tag.to as TagView).fullPath !== currentRoute.fullPath) {
              store.dispatch('tagsView/updateVisitedView', currentRoute)
            }
          }
        }
      })
    }

    watch(() => currentRoute.name, () => {
      if (currentRoute.name !== 'Login') {
        addTags()
        moveToCurrentTag()
      }
    })

    watch(() => state.visible, (value) => {
      if (value) {
        document.body.addEventListener('click', state.closeMenu)
      } else {
        document.body.removeEventListener('click', state.closeMenu)
      }
    })

    // life cricle
    onBeforeMount(() => {
      initTags()
      addTags()
    })

    return {
      visitedViews,
      routes,
      scrollPaneRef,
      ...toRefs(state)
    }
  }
})


</script>

<style lang="scss" scoped>
.tags-view-container {
  height: 34px;
  width: 100%;
  background: #fff;
  border-bottom: 1px solid #d8dce5;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, .12), 0 0 3px 0 rgba(0, 0, 0, .04);

  .tags-view-wrapper {
    .tags-view-item {
      display: inline-block;
      position: relative;
      cursor: pointer;
      height: 26px;
      line-height: 26px;
      border: 1px solid #d8dce5;
      color: #495060;
      background: #fff;
      padding: 0 8px;
      font-size: 12px;
      margin-left: 5px;
      margin-top: 4px;

      &:first-of-type {
        margin-left: 15px;
      }

      &:last-of-type {
        margin-right: 15px;
      }

      &.active {
        background-color: #42b983;
        color: #fff;
        border-color: #42b983;

        &::before {
          content: '';
          background: #fff;
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          position: relative;
          margin-right: 2px;
        }
      }
    }
  }

  .contextmenu {
    margin: 0;
    background: #fff;
    z-index: 3000;
    position: absolute;
    list-style-type: none;
    padding: 5px 0;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 400;
    color: #333;
    box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, .3);

    li {
      margin: 0;
      padding: 7px 16px;
      cursor: pointer;

      &:hover {
        background: #eee;
      }
    }
  }
}
</style>

<style lang="scss">
//reset element css of el-icon-close
.tags-view-wrapper {
  .tags-view-item {
    .el-icon-close {
      width: 16px;
      height: 16px;
      vertical-align: 2px;
      border-radius: 50%;
      text-align: center;
      transition: all .3s cubic-bezier(.645, .045, .355, 1);
      transform-origin: 100% 50%;

      &:before {
        transform: scale(.6);
        display: inline-block;
        vertical-align: -3px;
      }

      &:hover {
        background-color: #b4bccc;
        color: #fff;
      }
    }
  }
}
</style>
