<template>
  <el-breadcrumb class="app-breadcrumb" separator="/">
    <transition-group name="breadcrumb">
      <el-breadcrumb-item v-for="(item,index) in levelList" :key="item.path">
        <span v-if="item.redirect==='noRedirect'||index==levelList.length-1"
              class="no-redirect">
          {{ item.meta.title }}
        </span>
        <a v-else @click.prevent="handleLink(item)">{{ item.meta.title }}</a>
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script lang="ts">

import {defineComponent, onBeforeMount, reactive, toRefs,watch} from "vue";
import {compile} from 'path-to-regexp'
import {useRoute, RouteLocationMatched} from "vue-router";
import router from "@router";

export default defineComponent({
  setup() {
    const currentRoute = useRoute();
    const pathCompile = (path: string) => {
      const {params} = currentRoute
      const toPath = compile(path)
      return toPath(params)
    }
    const state = reactive({
      levelList: [] as Array<RouteLocationMatched>,
      getBreadcrumb: () => {
        let matched = currentRoute.matched.filter((item) => item.meta && item.meta.title)
        const first = matched[0]
        if (!state.isDashboard(first)) {
          matched = [{path: '/dashboard', meta: {title: 'dashboard'}} as any].concat(matched)
        }
        state.levelList = matched.filter((item) => {
          return item.mate && item.meta.title && item.meta.breadcrumb !== false
        })
      },
      isDashboard(route: RouteLocationMatched) {
        const name = route && route.name
        if (!name) {
          return false
        }
        return name.trim().toLocaleLowerCase() === 'Dashboard'.toLocaleLowerCase()
      },
      handleLink(item: any) {
        const {redirect, path} = item
        if (redirect) {
          router.push(redirect)
          return
        }
        router.push(pathCompile(path))
      }
    })
    watch(() => currentRoute.path, (path) => {
      if (path.startsWith('/redirect/')) {
        return
      }
      state.getBreadcrumb()
    })
    onBeforeMount(() => {
      state.getBreadcrumb()
    })

    return {
      ...toRefs(state)
    }
  }
})

</script>
<style lang="scss" scoped>
.app-breadcrumb.el-breadcrumb {
  display: inline-block;
  font-size: 14px;
  line-height: 50px;
  margin-left: 8px;

  .no-redirect {
    color: #97a8be;
    cursor: text;
  }
}
</style>
