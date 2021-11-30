  <template>
    <div v-if="!item.meta || !item.meta.hidden" >
      <template
          v-if="!alwaysShowRootMenu && theOnlyOneChild && !theOnlyOneChild.children"
      >
        <AppLink
            v-if="theOnlyOneChild.meta"
            :to="resolvePath(theOnlyOneChild.path)"
        >
          <el-menu-item
              :index="resolvePath(theOnlyOneChild.path)"
              :class="{'submenu-title-noDropdown': isFirstLevel}"
          >
            <svg-icon v-if="theOnlyOneChild.meta&&theOnlyOneChild.meta.icon" :icon-class="theOnlyOneChild.meta.icon"></svg-icon>
            <span v-if="theOnlyOneChild.meta && theOnlyOneChild.meta.title">{{ theOnlyOneChild.meta.title }}</span>
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
              :is-first-level="false"
              :base-path="resolvePath(child.path)"
              class="nest-menu"
          />
        </template>
      </el-sub-menu>
    </div>
  </template>


<script lang="ts">
import path from 'path-browserify'
import {defineComponent, PropType, reactive,computed } from "vue";
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
    isFirstLevel: {
      type: Boolean,
      required: true
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
    const alwaysShowRootMenu = computed(() => {
      if (props.item.meta && props.item.meta.alwaysShow) {
        return true
      } else {
        return false
      }
    })

    const showingChildNumber = computed(() => {
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

    const theOnlyOneChild = computed(() => {
      if (showingChildNumber.value > 1) {
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
      // because this.basePath already conatins item's path information
      return { ...props.item, path: '' }
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
      alwaysShowRootMenu,
      showingChildNumber,
      theOnlyOneChild,
      resolvePath
    }
  }
})

</script>