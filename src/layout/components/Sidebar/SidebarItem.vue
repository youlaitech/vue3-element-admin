<template>
  <div v-if="!item.meta || !item.meta.hidden" :class="[
      isCollapse ? 'simple-mode' : 'full-mode',
      {'first-level': !isNest}]">
    <template
        v-if="!alwaysShowParent && onlyOneChild && !onlyOneChild.children"
    >
      <AppLink
          v-if="onlyOneChild.meta"
          :to="resolvePath(onlyOneChild.path)"
      >
        <el-menu-item
            :index="resolvePath(onlyOneChild.path)"
            :class="{'submenu-title-noDropdown':!isNest}"
        >
          <svg-icon v-if="onlyOneChild.meta&&onlyOneChild.meta.icon" :icon-class="onlyOneChild.meta.icon"></svg-icon>
          <span v-if="onlyOneChild.meta && onlyOneChild.meta.title">{{ onlyOneChild.meta.title }}</span>
        </el-menu-item>
      </AppLink>
    </template>
    <el-sub-menu
        v-else
        :index="resolvePath(item.path)"
    >
      <!-- popper-append-to-body -->
      <template #title>
        <svg-icon v-if="item.meta&&item.meta.icon" :icon-class="item.meta.icon"></svg-icon>
        <span v-if="item.meta && item.meta.title">{{ item.meta.title }}</span>
      </template>
      <template v-if="item.children">
        <sidebar-item
            v-for="child in item.children"
            :key="child.path"
            :item="child"
            :is-collapse="isCollapse"
            :is-nest="true"
            :base-path="resolvePath(child.path)"
            class="nest-menu"
        />
      </template>
    </el-sub-menu>
  </div>
</template>


<script lang="ts">
import path from 'path-browserify'
import {defineComponent, PropType, computed} from "vue";
import {RouteRecordRaw} from 'vue-router'
import {isExternal} from '@utils/validate'
import AppLink from './Link.vue'
import SvgIcon from '@/components/SvgIcon/index.vue';


export default defineComponent({
  props: {
    item: {
      type: Object as PropType<RouteRecordRaw>,
      required: true
    },
    isCollapse: {
      type: Boolean,
      required: false
    },
    isNest: {
      type: Boolean,
      required: false
    },
    basePath: {
      type: String,
      required: true
    }
  },
  components: {
    AppLink,
    SvgIcon
  },
  setup(props) {
    const alwaysShowParent = computed(() => {
      if (props.item.meta && props.item.meta.alwaysShow) {
        return true
      } else {
        return false
      }
    })

    const showingChildrenNum = computed(() => {
      if (props.item.children) {
        const showingChildren = props.item.children.filter((item) => {
          if (item.meta && item.meta.hidden) {
            return false
          } else {
            return true
          }
        })
        return showingChildren.length
      }
      return 0
    })

    const onlyOneChild = computed(() => {
      if (showingChildrenNum.value > 1) {
        return null
      }
      if (props.item.children) {
        for (const child of props.item.children) {
          if (!child.meta || !child.meta.hidden) {
            return child
          }
        }
      }
      // If there is no children, return itself with path removed,
      // because this.basePath already contains item's path information
      return {...props.item, path: ''}
    })

    const resolvePath = (routePath: string) => {
      if (isExternal(routePath)) {
        return routePath
      }
      if (isExternal(props.basePath)) {
        return props.basePath
      }
      return path.resolve(props.basePath, routePath)
    }

    return {
      alwaysShowParent,
      showingChildrenNum,
      onlyOneChild,
      resolvePath
    }
  }
})

</script>

<style lang="scss" scoped>
.el-sub-menu.is-active > .el-sub-menu__title {
  color: #f4f4f5 !important;
}

.full-mode {
  .nest-menu .el-sub-menu > .el-sub-menu__title,
  .el-sub-menu .el-menu-item {
    min-width: 210px !important;
    #background-color: #1f2d3d !important;

    &:hover {
      background-color: #001528 !important;
    }
  }

  .el-menu-item {
    & > span {
      display: inline-block;
      padding-left: 5px;
    }
  }

  .el-sub-menu {
    overflow: hidden;

    & > .el-sub-menu__title {
      .el-sub-menu__icon-arrow {
        display: none;
      }

      & > span {
        padding-left: 5px;

      }
    }
  }
}

.simple-mode {
  &.first-level {
    .submenu-title-noDropdown {
      padding: 0 !important;
      position: relative;

      .el-tooltip {
        padding: 0 !important;
      }

      & > span{
        display: none;
      }
      & > svg{
        margin-left: 20px;
      }
    }

    .el-sub-menu {
      overflow: hidden;


      & > .el-sub-menu__title {
        padding: 0px !important;

        .el-sub-menu__icon-arrow {
          display: none;
        }

        & > span {
          visibility: hidden;
        }
      }
    }
  }
}
</style>