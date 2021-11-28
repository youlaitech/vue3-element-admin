<template>
  <div>
    <div v-if="!item.meta ||!item.meta.hidden">
      <!-- 非嵌套路由 -->
      <template
          v-if="!item.children||item.children.length==0">
        <app-link v-if="item.meta" :to="resolvePath(item.path)">
          <el-menu-item :index="resolvePath(item.path)" :class="{'submenu-title-noDropdown':!isNest}">
            <svg-icon v-if="item.meta && item.meta.icon" :icon-class="item.meta.icon"></svg-icon>
            <span v-if="item.meta && item.meta.title">{{ item.meta.title }}</span>
          </el-menu-item>
        </app-link>
      </template>

      <!-- 嵌套路由 -->
      <el-sub-menu v-else ref="subMenu" :index="resolvePath(item.path)" popper-append-to-body>
        <template #title>
          <svg-icon v-if="item.meta&&item.meta.icon" :icon-class="item.meta.icon"></svg-icon>
          <span v-if="item.meta && item.meta.title">{{ item.meta.title }}</span>
        </template>

        <sidebar-item
            v-for="child in item.children"
            :key="child.path"
            :is-nest="true"
            :item="child"
            :base-path="resolvePath(child.path)"
            class="nest-menu"
        />
      </el-sub-menu>
    </div>
  </div>

</template>

<script lang="ts">
import path from 'path-browserify'
import {defineComponent, PropType} from "vue";
import {RouteRecordRaw} from 'vue-router'
import {isExternal} from '@utils/validate'
import AppLink from './Link.vue'
import SvgIcon from '@/components/SvgIcon/index.vue';


export default defineComponent({
  name: 'SidebarItem',
  components: {SvgIcon, AppLink},
  props: {
    item: {
      type: Object as PropType<RouteRecordRaw>,
      required: true
    },
    isNest: {
      type: Boolean,
      default: false
    },
    basePath: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const resolvePath = (routePath: string) => {
      if (isExternal(routePath)) {
        return routePath
      }
      if (isExternal(props.basePath)) {
        return props.basePath
      }
      console.log(props.basePath,routePath)
      return path.resolve(props.basePath, routePath)
    }

    return {
      resolvePath
    }
  }
})

</script>